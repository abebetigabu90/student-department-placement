import mongoose from 'mongoose'
import Student from '../models/student.js';
import Department from '../models/Department.js';
// import dotenv from 'dotenv';
// import connectDB from '../config/db.js';
import Preference from '../models/preferences.js'
import Placement from '../models/Placement.js'
import chalk from 'chalk'
export const GenplacementForFirstSemNatural = async () => {
    try {
        console.log(chalk.yellow.bold("🔍 Starting placement query..."));
        const naturalFirstSem = await Student.find({
            stream: 'Natural Science',
            gpa: { $exists: true },
            cgpa: { $in: [null, undefined] },
            Department:{ $in: [null, undefined] },
            totalScore:{ $exists: true }
        });

        if (naturalFirstSem.length === 0) {
            console.log(chalk.blue.bold('❌ No students found. Checking individual conditions...'));
            
            // Debug each condition separately
            const streamCheck = await Student.countDocuments({ stream: 'Natural Science' });
            const gpaCheck = await Student.countDocuments({ gpa: { $exists: true } });
            const cgpaCheck = await Student.countDocuments({cgpa: { $in: [null, undefined] }});
            const deptCheck = await Student.countDocuments({ 
                $or: [{ Department: null }, { Department: { $exists: false } }] 
            });
            const scoreCheck = await Student.countDocuments({ totalScore: { $exists: true } });
            
            console.log(chalk.yellow(`🔍 Condition breakdown:`));
            console.log(chalk.yellow(`   - Stream 'Natural Science': ${streamCheck} students`));
            console.log(chalk.yellow(`   - Has GPA: ${gpaCheck} students`));
            console.log(chalk.yellow(`   - No CGPA: ${cgpaCheck} students`));
            console.log(chalk.yellow(`   - No Department: ${deptCheck} students`));
            console.log(chalk.yellow(`   - Has totalScore: ${scoreCheck} students`));
            
            return { message: 'No students to place' };
        }

        console.log(chalk.green.bold("Sorting students by score in descending order and assigning departments"));
        const sortedStudents = naturalFirstSem.sort((a, b) => b.totalScore - a.totalScore);

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
            if (currentDept.totalAssignedStudents < currentDept.capacity) {
                // Update department count
                await Department.findByIdAndUpdate(
                    currentDept._id,
                    { $inc: { totalAssignedStudents: 1 } }
                );

                // Update student department
                await Student.findByIdAndUpdate(stu._id, { Department: currentDept._id });

                // Create placement
                const placement = new Placement({
                    student: stu._id,
                    department: currentDept._id,
                    priority: pref.priority
                });
                
                await placement.save();
                placementResults.push(placement);
                placedCount++;
                
                console.log(chalk.green(`Placed student ${stu.studentId} ${stu.firstName} in ${currentDept.name}`));
            } else {
                console.log(chalk.yellow(`Department ${currentDept.name} is full for student ${stu.studentId}`));
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










//female quota balancing function
export const femaleQuota_AdjustmentForNaturalSem1 = async () => {
    try {
        console.log('🎯 Starting female quota adjustment for Natural Science departments...');
        
        const departments = await Department.find({
            name: {$in: [/^computer science$/i, /^medicine$/i, /^pharmacy$/i, /^other natural$/i, /^IT$/i, /^engineering$/i]}
        });

        let totalProcessed = 0;
        let totalSkipped = 0;
        let totalErrors = 0;

        for (const dept of departments) {
            try {
                console.log(chalk.yellow(`\nProcessing department: ${dept.name}`));
                
                // Check current department stats
                const females = await Student.find({ gender: 'Female', Department: dept._id });
                const males = await Student.find({ gender: 'Male', Department: dept._id });
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

                if (dept.totalAssignedStudents == 0) {
                    console.log(chalk.white(`No students assigned to ${dept.name}`));
                    totalSkipped++;
                    continue;
                }

                // Find available female students who want this department
                const femaleStudents = await Student.find({ gender: 'Female', Department: null });
                const femaleStudentIds = femaleStudents.map(student => student._id);
                
                const FemalesWhoWantDept = await Preference.find({
                    department: dept._id,
                    priority: 1,
                    student: { $in: femaleStudentIds }
                }).populate('student'); // Populate student data for better logging

                if (FemalesWhoWantDept.length == 0) {
                    console.log(chalk.green.bold(`No females with first preference for ${dept.name}`));
                    totalSkipped++;
                    continue;
                }

                console.log(chalk.magenta.bold(`🔄 Adjusting: ${currentFemalesCount}/${totalStudentsOfdept} females, need ${neededFemales} more, found ${FemalesWhoWantDept.length} candidates`));

                // Process without transactions
                const sortedMales = males.sort((a, b) => a.totalScore - b.totalScore);
                const femalesToProcess = FemalesWhoWantDept.length <= neededFemales 
                    ? FemalesWhoWantDept 
                    : FemalesWhoWantDept.sort((a, b) => b.totalScore - a.totalScore).slice(0, neededFemales);

                let replacementsMade = 0;

                // Process each student replacement
                for (let i = 0; i < femalesToProcess.length; i++) {
                    if (i >= sortedMales.length) {
                        console.log(chalk.yellow(`⚠️  Only ${sortedMales.length} males available, cannot replace more`));
                        break;
                    }

                    // Remove male student from department (but keep student record)
                    await Student.updateOne(
                        { _id: sortedMales[i]._id },
                        { $set: { Department: null } } // Remove from department
                    );
                    
                    // Delete male student's placement
                    await Placement.deleteOne(
                        { student: sortedMales[i]._id }
                    );

                    // Assign female student to department
                    await Student.updateOne(
                        { _id: femalesToProcess[i].student },
                        { $set: { Department: dept._id } }
                    );
                    
                    // Create new placement for female student
                    const placement = new Placement({
                        student: femalesToProcess[i].student,
                        department: dept._id,
                        priority: 1
                    });
                    await placement.save();

                    // Note: Department totalAssignedStudents remains the same since we're replacing
                    // If you want to track the change in female/male ratio differently, adjust here

                    replacementsMade++;
                    console.log(chalk.green(`✓ Replaced male: ${sortedMales[i].firstName} ${sortedMales[i].middleName} with female: ${femalesToProcess[i].student.firstName} ${femalesToProcess[i].student.middleName}`));
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
export const placementForUnplacedFirstSemNatural = async () => {
    try {
        console.log("Starting placement for unplaced Natural Science students...");
        
        // Find students who need placement
        const unplacedStudents = await Student.find({
            stream: 'Natural Science',
            Department: null, // Not placed in any department yet
            totalScore: { $exists: true }
        });

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
            console.log(`\nProcessing student: ${student.firstName} ${student.lastName}`);
            
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

                // Check if department has space
                if (department.totalAssignedStudents < department.capacity) {
                    // Place the student
                    await Student.findByIdAndUpdate(student._id, {
                        Department: department._id
                    });

                    await Department.findByIdAndUpdate(department._id, {
                        $inc: { totalAssignedStudents: 1 }
                    });

                    // Create placement record
                    const placement = new Placement({
                        student: student._id,
                        department: department._id,
                        priority: preference.priority
                    });
                    await placement.save();

                    console.log(`✅ Placed ${student.firstName} in ${department.name} (Choice #${preference.priority})`);
                    placedCount++;
                    studentPlaced = true;
                    break; // Stop looking for other preferences
                } else {
                    console.log(`❌ ${department.name} is full`);
                }
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