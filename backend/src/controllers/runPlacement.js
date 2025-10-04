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
const femaleQuota_AdjustmentForNaturalSem1 = async () => {
    const departments = await Department.find({
        name: {$in: [/^computer science$/i, /^medicine$/i, /^pharmacy$/i, /^other natural$/i, /^IT$/i, /^engineering$/i]}
    });

    for (const dept of departments) {
        // First, check if we need adjustments WITHOUT starting a transaction
        const females = await Student.find({ gender: 'Female', Department: dept.deptID });
        const males = await Student.find({ gender: 'Male', Department: dept.deptID });
        const totalStudentsOfdept = females.length + males.length;
        const ratioOfdept = females.length / totalStudentsOfdept;

        // ✅ Check conditions BEFORE starting transaction
        if (ratioOfdept >= 0.2) {
            console.log(chalk.blue.bold(`No adjustment needed for ${dept.name}`));
            continue; // Skip to next department - no transaction needed
        }

        if (dept.totalAssignedStudents == 0) {
            console.log(chalk.white(`No students assigned to ${dept.name}`));
            continue; // Skip to next department - no transaction needed
        }

        // Find females who want this department
        const femaleStudents = await Student.find({ gender: 'Female', Department: null });
        const femaleStudentIds = femaleStudents.map(student => student._id);
        
        const FemalesWhoWantDept = await Preference.find({
            department: dept._id,
            priority: 1,
            student: { $in: femaleStudentIds }
        });

        const maxWantedFemales = Math.ceil(0.2 * totalStudentsOfdept);

        if (FemalesWhoWantDept.length == 0) {
            console.log(chalk.green.bold(`No females with first preference for ${dept.name}`));
            continue; // Skip to next department - no transaction needed
        }

        // ✅ ONLY NOW start transaction - when we actually have changes to make
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            console.log(chalk.magenta.bold(`Processing female quota adjustment for ${dept.name}`));

            const sortedMales = males.sort((a, b) => a.totalScore - b.totalScore);
            const femalesToProcess = FemalesWhoWantDept.length <= maxWantedFemales 
                ? FemalesWhoWantDept 
                : FemalesWhoWantDept.sort((a, b) => b.totalScore - a.totalScore).slice(0, maxWantedFemales);

            // Process each student replacement
            for (let i = 0; i < femalesToProcess.length; i++) {
                if (i >= sortedMales.length) break;

                await Department.updateOne(
                    { deptID: dept.deptID }, 
                    { $inc: { totalAssignedStudents: -1 } },
                    { session }
                );
                
                await Placement.deleteOne(
                    { student: sortedMales[i]._id },
                    { session }
                );

                await Student.updateOne(
                    { _id: femalesToProcess[i].student },
                    { $set: { Department: dept.deptID } },
                    { session }
                );
                
                await Department.updateOne(
                    { deptID: dept.deptID }, 
                    { $inc: { totalAssignedStudents: 1 } },
                    { session }
                );
            }

            await session.commitTransaction();
            console.log(chalk.green.bold(`Female quota balancing for ${dept.name} completed`));

        } catch (error) {
            await session.abortTransaction();
            console.error(`Error in department ${dept.name}:`, error);
            throw error;
        } finally {
            session.endSession();
        }
    }
};




// const femaleQuota_AdjustmentForNaturalSem1 = async()=>{
//     // since female quota adjustment should be done in different levels at this level the female quota adjustment is on the listed departments to manage easily and to fix the error easily if it occur .
// const departments = await Department.find({name:{$in:[/^computer science$/i,/^medicine$/i,/^pharmacy$/i,/^other natural$/i,/^IT$/i,/^engineering$/i]}})
// for(const dept of departments){
//     const females = await Student.find({gender:'Female',Department:dept.deptID})
//     const males = await Student.find({gender:'Male',Department:dept.deptID})
//     const totalStudentsOfdept = females.length + males.length
//     const ratioOfdept = females.length/totalStudentsOfdept
//     if(ratioOfdept>=0.2){
//         console.log(chalk.blue.bold(`there is no need of female quota adjustment for department ${dept.name}. already adjusted!`))
//          continue
//     }
//     else{
//         if(dept.totalAssignedStudents == 0){
//             console.log(chalk.white(`there is no any student assigned on department ${dept.name}`))
//             continue
//         }
//         console.log(chalk.magenta.bold(`processing...female quota adjustment for department ${dept.name} `))
//         // the ff codes finds female students whose first preference of dept is priority 1
//         const femaleStudents = await Student.find({ gender: 'Female',Department:null });
//         const femaleStudentIds = femaleStudents.map(student => student._id);
//         const FemalesWhoWantDept = await Preference.find({
//         department: dept._id,
//         priority: 1,
//         student: { $in: femaleStudentIds }
//         });
//         // const FemalesWhoWantDept = await Student.find({gender:'Female',$or:[{Department:null},{Department:{$ne:dept.deptID}}],"preferences.0":dept.name})  // females who want dept to be placed
//         const maxWantedFemales = Math.ceil(0.2*totalStudentsOfdept)
//         if(FemalesWhoWantDept.length == 0){
//             console.log(chalk.green.bold(`there is no any female whose first preference ${dept.name}.`))
//         }
//         else if(FemalesWhoWantDept.length<=maxWantedFemales){
//             const sortedMales = males.sort((a,b)=>{return a.totalScore - b.totalScore})
//             for(let i=0;i < FemalesWhoWantDept.length;i++){
//                 //the ff two lines of codes displace the least score males to make the department free to place males 
                

//                 const session = await mongoose.startSession();
//                 session.startTransaction();

//                 try {
//                 await Department.updateOne(
//                     {deptID: dept.deptID}, 
//                     {$inc: {totalAssignedStudents: -1}},
//                     {session}
//                 );
                
//                 await Placement.deleteOne(
//                     {student: sortedMales[i]},
//                     {session}
//                 );
//                  //the ff codes used to assign freed departments for females
//                 await Student.updateOne({studentId:FemalesWhoWantDept[i].studentId},{$set:{Department:dept.deptID}},{session})
//                 await Department.updateOne(
//                     {deptID: dept.deptID}, 
//                     {$inc: {totalAssignedStudents: 1}},
//                     {session}
//                 );
//                 console.log(chalk.green.bold(`female quota balancing on department ${dept.name} completely done.`))
//                 await session.commitTransaction();
//                 } catch (error) {
//                 await session.abortTransaction();
//                 throw error;
//                 } finally {
//                 session.endSession();
//                 }
//             }
//         }
//         //the ff else code is if females count who want dept is greater than the maximum needed females to fill the quota
//         else{
//             const sortedMales = males.sort((a,b)=>{return a.totalScore - b.totalScore})
//             const sortedFemalesWhoWantDept = FemalesWhoWantDept.sort((a,b)=>{return b.totalScore - a.totalScore}) 
//             for(let i=0;i < maxWantedFemales;i++){
//                 const session = await mongoose.startSession();
//                 session.startTransaction();

//                 try {
//                 await Department.updateOne(
//                     {deptID: dept.deptID}, 
//                     {$inc: {totalAssignedStudents: -1}},
//                     {session}
//                 );
                
//                 await Placement.deleteOne(
//                     {student: sortedMales[i]},
//                     {session}
//                 );
//                  //the ff codes used to assign freed departments for females
//                 await Student.updateOne({studentId:sortedFemalesWhoWantDept[i].studentId},{$set:{Department:dept.deptID}},{session})
//                 await Department.updateOne(
//                     {deptID: dept.deptID}, 
//                     {$inc: {totalAssignedStudents: 1}},
//                     {session}
//                 );
//                 console.log(chalk.green.bold(`female quota balancing on department ${dept.name} completely done.`))
//                 await session.commitTransaction();
//                 } catch (error) {
//                 await session.abortTransaction();
//                 throw error;
//                 } finally {
//                 session.endSession();
//                 }

//             }
//         }
//     }
// }

// }

//  runPlacementforNaturalSem1()
// const clearPlacement=async()=>{
//     await Student.updateMany({},{$set:{Department:null}})
//     await Department.updateMany({},{$set:{assignedStudents:[],totalAssignedStudents:0}})
// }  
//clearPlacement()



//next step is assign by checking his preference is from the 6 natural student alternatives  and assign only once one department  for each student by checking department capacity iteratively for each prefence
            //then check female quota of each department iteratively 
            //unsign the last male student from the department and assign for top female among not assigned yet but prefers it untill 20% of female reached or no female need it or for all departments
            //re assign male students who are replaced by female on the department of other their choose which is still not filled





