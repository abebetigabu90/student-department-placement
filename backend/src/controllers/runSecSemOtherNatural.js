import mongoose from 'mongoose'
import Student from '../models/student.js';
import Department from '../models/Department.js';
import Preference from '../models/preferences.js'
import Placement from '../models/Placement.js'
import chalk from 'chalk'
export const GenplacementForOtherNat = async () => {
    try {
        console.log(chalk.yellow.bold("🔍 Starting placement query..."));
        const OtherNatDept = await Department.findOne({name:'other natural'})
        const OtherNatStudents = await Student.find({Department:OtherNatDept._id});
        if (OtherNatStudents.length === 0) {
            console.log(chalk.blue.bold('❌ No students found'));
            return { message: 'No students to place' };
        }

        console.log(chalk.green.bold("Sorting students by score in descending order and assigning departments"));
        const sortedStudents = OtherNatStudents.sort((a, b) => b.totalScore - a.totalScore);

        const placementResults = [];
        let placedCount = 0;

        for (const stu of sortedStudents) {
            const pref = await Preference.findOne({ student: stu._id, priority: 1 });
            
            if (!pref) {
                console.log(chalk.red(`Student ${stu.studentId} has no first preference`));
                continue;
            }

            const currentDept = await Department.findById(pref.department);
            if (!currentDept) {
                console.log(chalk.yellow(`Department not found for student ${stu.studentId}`));
                continue;
            }
            // Check capacity with strict inequality            
            try {
                const updatedDept = await Department.findOneAndUpdate(
                    { 
                            _id: currentDept._id, 
                            $expr: { $lt: ["$totalAssignedStudents", "$capacity"] } 
                    },
                    { $inc: { totalAssignedStudents: 1 } },
                    { new: true }
                  );

                if (!updatedDept) {
                    // Department is already full, cannot assign this student
                    console.log(`Department ${currentDept._id} is full. Student ${stu._id} not assigned.`);
                    continue;
                }
                // Prepare fields to update on the student
                const studentUpdate = {
                    Department: updatedDept._id, // use correct field name (lowercase is typical)
                };
                await Student.findByIdAndUpdate(stu._id, studentUpdate);

                console.log(`Student ${stu._id} assigned to ${updatedDept._id} successfully.`);
                //update the old placement since already exists
                const placement = await Placement.updateOne({student: stu._id},{department: currentDept._id,priority: 1})
                placementResults.push(placement);
                placedCount++;
                console.log(chalk.green(`Placed student ${stu.studentId} ${stu.firstName} in ${currentDept.name}`)); 
                }
             catch (err) {
                console.error(`Error assigning student ${stu._id} to department ${currentDept._id}:`, err);
            } 
        }
        console.log(chalk.green.bold(`Successfully placed ${placedCount} students`));
        return { 
            message: `Placement completed - ${placedCount} students placed with priority 1`,
            placements: placementResults 
        };

    } catch (error) {
        console.error(chalk.red('Placement error:'), error);
        return { error: 'Placement failed', details: error.message };
    }
};
//the ff function is for female quota rebalancing 
export const femaleQuota_AdjustmentForOtherNat = async () => {
    try {
        console.log('🎯 Starting female quota adjustment for Other Natural departments...');
        const OtherNatDept = await Department.findOne({name:'other natural'}) //this code is usefull for later not now
        const departments = await Department.find({
            PrefTimeCategory:'SecSemFirst',PrefTypeCategory:'OtherNatural'
        });

        let totalProcessed = 0;
        let totalSkipped = 0;
        let totalErrors = 0;

        for (const dept of departments) {
            try {
                console.log(chalk.yellow(`\nProcessing department: ${dept.name}`));
                
                // Check current department stats
                const females = await Student.find({ 
                    gender: { $regex: /^F/i }, 
                    Department: dept._id 
                }).populate('Department');
                
                const males = await Student.find({ 
                    gender: { $regex: /^M/i }, 
                    Department: dept._id 
                }).populate('Department');
                
                const totalStudentsOfdept = females.length + males.length;
                const currentFemalesCount = females.length;
                
                // Avoid division by zero
                if (totalStudentsOfdept === 0) {
                    console.log(chalk.white(`No students in ${dept.name}`));
                    totalSkipped++;
                    continue;
                }      
                const ratioOfdept = currentFemalesCount / totalStudentsOfdept;
                const targetFemalesCount = Math.ceil(0.2 * totalStudentsOfdept);
                
                // Calculate needed females (ensure non-negative)
                const neededFemales = Math.max(0, targetFemalesCount - currentFemalesCount);

                // Check if adjustment needed
                if (neededFemales === 0) {
                    console.log(chalk.blue.bold(`✓ Ratio ${(ratioOfdept*100).toFixed(1)}% - No adjustment needed for ${dept.name}`));
                    totalSkipped++;
                    continue;
                }

                // Find available female students who want this department
                const femaleStudents = await Student.find({ 
                    gender: { $regex: /^F/i },
                    Department:OtherNatDept._id

                });
                const femaleStudentIds = femaleStudents.map(student => student._id);
                
                const FemalesWhoWantDept = await Preference.find({
                    department: dept._id,
                    priority: 1,
                    student: { $in: femaleStudentIds }
                }).populate('student');

                if (FemalesWhoWantDept.length == 0) {
                    console.log(chalk.green.bold(`No females with first preference for ${dept.name}`));
                    totalSkipped++;
                    continue;
                }

                console.log(chalk.magenta.bold(`🔄 Adjusting: ${currentFemalesCount}/${totalStudentsOfdept} females, need ${neededFemales} more, found ${FemalesWhoWantDept.length} candidates`));

                // Sort males by lowest score first (to replace weakest males first)
                const sortedMales = males.sort((a, b) => a.totalScore - b.totalScore);
                
                // Sort females by highest score first (to pick best females first)
                const femalesToProcess = FemalesWhoWantDept.length <= neededFemales 
                    ? FemalesWhoWantDept 
                    : FemalesWhoWantDept.sort((a, b) => b.student.totalScore - a.student.totalScore).slice(0, neededFemales);

                let replacementsMade = 0;

                // Process each student replacement
                for (let i = 0; i < femalesToProcess.length; i++) {
                    // Define variables at the start of each iteration
                    const currentFemaleId = femalesToProcess[i].student._id;
                    const currentFemaleName = `${femalesToProcess[i].student.firstName} ${femalesToProcess[i].student.middleName}`;
                    let replacementSuccess = false;
                    
                    try {
                        if (i >= sortedMales.length) {
                            console.log(chalk.yellow(`⚠️  Only ${sortedMales.length} males available, cannot replace more`));
                            break;
                        }

                        const currentMaleId = sortedMales[i]._id;
                        const currentMaleName = `${sortedMales[i].firstName} ${sortedMales[i].middleName}`;

                        console.log(chalk.blue(`🔄 Replacing male ${currentMaleName} with female ${currentFemaleName}`));
                        await Promise.all([
                            Student.findByIdAndUpdate(currentFemaleId, { Department: dept._id }),
                            Student.findByIdAndUpdate(currentMaleId, { Department: OtherNatDept._id }),
                            Placement.updateOne({ student: currentFemaleId }, { department: dept._id, priority: 1 }),
                            Placement.updateOne({ student: currentMaleId }, { department: OtherNatDept._id })
                        ]);                        
                        replacementSuccess = true;
                        replacementsMade++;
                        
                        console.log(chalk.green(`✅ Successfully replaced male: ${currentMaleName} with female: ${currentFemaleName}`));
                        
                    } catch (error) {
                        if (!replacementSuccess) {
                            try {
                                await Student.findByIdAndUpdate(currentFemaleId, {Department: OtherNatDept._id});
                                await Placement.updateOne({student: currentFemaleId},{department: OtherNatDept._id})
                                console.log(chalk.yellow(`🔄 Rolled back female assignment for ${currentFemaleName}`));
                            } catch (rollbackError) {
                                console.error(chalk.red(`❌ Failed to rollback female assignment for ${currentFemaleName}:`), rollbackError);
                            }
                        }
                        console.error(chalk.red(`❌ Failed to replace at position ${i}:`), error);
                        // Continue with next replacement instead of failing entire department
                    }
                }
                console.log(chalk.green.bold(`✅ Female quota balancing for ${dept.name} completed: ${replacementsMade} replacements`));
                totalProcessed++;

            } catch (deptError) {
                totalErrors++;
                console.error(chalk.red(`❌ Error processing department ${dept.name}:`), deptError);
                // Continue with next department instead of failing completely
            }
        }
        // Final summary
        console.log(chalk.cyan.bold(`\n📊 Female Quota Adjustment Summary:`));
        console.log(chalk.cyan(`   Processed: ${totalProcessed} departments`));
        console.log(chalk.cyan(`   Skipped: ${totalSkipped} departments`));
        console.log(chalk.cyan(`   Errors: ${totalErrors} departments`));

        return {
            success: true,
            processed: totalProcessed,
            skipped: totalSkipped,
            errors: totalErrors,
            message: `Female quota adjustment completed: ${totalProcessed} processed, ${totalSkipped} skipped, ${totalErrors} errors`
        };

    } catch (error) {
        console.error(chalk.red.bold('💥 Critical error in femaleQuota_AdjustmentForNaturalSem1:'), error);
        throw error;
    }
};
// Placement for Natural Science students who didn't get their first choice
export const placementForUnplacedOtherNat = async () => {
    try {
        console.log("Starting placement for unplaced Natural Science students...");
        // Find students who need placement
        const OtherNatDept = await Department.findOne({name:'other natural'})
        const unplacedStudents = await Student.find({Department: OtherNatDept._id});
        if (unplacedStudents.length === 0) {
            console.log('No students need placement.');
            return { message: 'No students to place' };
        }
        console.log(`Found ${unplacedStudents.length} students to place`);
        
        // Sort students by score (highest first)
        const sortedStudents = unplacedStudents.sort((a, b) => b.totalScore - a.totalScore);
        
        let placedCount = 0;
        // Process each student one by one
        for (const student of sortedStudents) {
            console.log(`\nProcessing student: ${student.firstName} ${student.middleName}`);
            
            // Get student's preferences
            const preferences = await Preference.find({ 
                student: student._id 
            }).sort({ priority: 1 }); // Sort by priority (1st, 2nd, 3rd...)

            if (preferences.length === 0) {
                console.log(`❌ No preferences found for ${student.firstName}`);
                continue;
            }
            let studentPlaced = false;
            // Try each preference in order
            for (const preference of preferences) {
                const department = await Department.findById(preference.department);
                
                if (!department) {
                    console.log(`Department not found for preference`);
                    continue;
                }
                    const updatedDept = await Department.findOneAndUpdate(
                        { 
                            _id: department._id, 
                            $expr: { $lt: ["$totalAssignedStudents", "$capacity"] } 
                        },
                        { $inc: { totalAssignedStudents: 1 } },
                        { new: true }
                    );
                if (!updatedDept) {
                    // Department is already full, cannot assign this student
                    console.log(`Department ${department._id} is full. Student ${student._id} not assigned.`);
                    continue;
                }
                // Prepare fields to update on the student
                const studentUpdate = {Department: updatedDept._id,};
                await Student.findByIdAndUpdate(student._id, studentUpdate);
                console.log(`✅ Placed ${student.firstName} in ${department.name} (Choice #${preference.priority})`);
                placedCount++;
                studentPlaced = true;
                //update the old placement since already exists
                const placement = await Placement.updateOne({student: student._id},{department: updatedDept._id,priority: preference.priority})
                break; // Stop looking for other preferences
            }

            if (!studentPlaced) {
                console.log(`❌ Could not place ${student.firstName} - all preferred departments are full`);
            }
        }
        console.log(`\n🎉 Placement completed!`);
        console.log(`Total students placed: ${placedCount}`);
        console.log(`Total students not placed: ${unplacedStudents.length - placedCount}`);

        return {
            success: true,
            placed: placedCount,
            total: unplacedStudents.length,
            message: `Placed ${placedCount} out of ${unplacedStudents.length} students`
        };

    } catch (error) {
        console.error('Error during placement:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
