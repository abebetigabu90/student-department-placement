import Student from '../models/student.js';
import Department from '../models/Department.js';
// import dotenv from 'dotenv';
// import connectDB from '../config/db.js';
import Preference from '../models/preferences.js'
import Placement from '../models/Placement.js'
import chalk from 'chalk'
//the ff code is used to assign a department for natural science and first semister student only
// export const GenplacementForFirstSemNatural = async () => {
//     const naturalFirstSem = await Student.find({
//         stream: 'Natural Science',
//         // gpa: { $exists: true },
//         // cgpa: { $exists: false },
//         // $or: [{ Department: null }, { Department: { $exists: false } }]
//     });

//     if (naturalFirstSem.length == 0) {
//         console.log(chalk.blue.bold('all first semester and natural science students are placed! or there is no student who fulfill this placement requirement'))
//         return ({ message: 'No students to place' });
//     }

//     // Get all priority 1 preferences for these students
//     const studentIds = naturalFirstSem.map(stu => stu._id);
//     const priority1Prefs = await Preference.find({ 
//         student: { $in: studentIds }, 
//         priority: 1 
//     }).populate('department');

//     // Filter students who have priority 1 preferences
//     const studentsWithPref = naturalFirstSem.filter((stu) => {
//         return priority1Prefs.some(pref => pref.student.toString() === stu._id.toString());
//     });

//     if (studentsWithPref.length == 0) {
//         console.log(chalk.red.bold('natural science student which has both total score and preference not found!'));
//         return ({ message: 'No students with priority 1 preferences' });
//     }

//     console.log(chalk.green.bold("sorting each student with score in descending order and assigning department"))
//     const sortedStudents = studentsWithPref.sort((a, b) => { return b.totalScore - a.totalScore });

//     const placementResults = [];

//     for (const stu of sortedStudents) {
//         // Find this student's priority 1 preference
//         const pref = priority1Prefs.find(pref => pref.student.toString() === stu._id.toString());
        
//         if (!pref || !pref.department) continue;

//         // Get CURRENT department data
//         const currentDept = await Department.findById(pref.department._id);        
//         if (!currentDept) continue;

//         // Check if department has capacity
//         if (currentDept.totalAssignedStudents < currentDept.capacity) {
//             // Update department count
//             await Department.findByIdAndUpdate(
//                 currentDept._id, // ← FIXED: use currentDept instead of dept
//                 { $inc: { totalAssignedStudents: 1 } }
//             );

//             // Create placement
//             const placement = new Placement({
//                 student: stu._id,
//                 department: currentDept._id, // ← FIXED: use currentDept
//                 priority: pref.priority
//             });
            
//             await placement.save();
//             placementResults.push(placement);
            
//             console.log(chalk.green(`Placed student ${stu.studentId} in ${currentDept.name}`)); // ← FIXED
//         } else {
//             console.log(chalk.yellow(`Department ${currentDept.name} is full for student ${stu.studentId}`)); // ← FIXED
//         }
//     }

//     console.log(chalk.green.bold(`Successfully placed ${placementResults.length} students`));
//     return ({ 
//         message: `Placement completed - ${placementResults.length} students placed with priority 1`,
//         placements: placementResults 
//     });
// };









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
            if (currentDept.totalAssignedStudents <= currentDept.capacity) {
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
                
                console.log(chalk.green(`Placed student ${stu.studentId} in ${currentDept.name}`));
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
//         if(dept.assignedStudents.length == 0){
//             console.log(chalk.white(`there is no any student assigned on department ${dept.name}`))
//             continue
//         }
//         console.log(chalk.magenta.bold(`processing...female quota adjustment for department ${dept.name} `))
//         const FemalesWhoWantDept = await Student.find({gender:'Female',$or:[{Department:null},{Department:{$ne:dept.deptID}}],"preferences.0":dept.name})  // females who want dept to be placed
//         const maxWantedFemales = Math.ceil(0.2*totalStudentsOfdept)
//         if(FemalesWhoWantDept.length == 0){
//             console.log(chalk.green.bold(`there is no any female whose first preference or preference[0] is ${dept.name}.`))
//         }
//         else if(FemalesWhoWantDept.length<=maxWantedFemales){
//             const sortedMales = males.sort((a,b)=>{return a.totalScore - b.totalScore})
//             for(let i=0;i < FemalesWhoWantDept.length;i++){
//                 //the ff two lines of codes displace the least score males to make the department free to place males 
//                 await Department.updateOne({deptID:dept.deptID},{$pull:{assignedStudents:sortedMales[i].studentId},$inc:{totalAssignedStudents:-1}})
//                 await Student.updateOne({studentId:sortedMales[i].studentId},{$set:{Department:null}})
//                 //since before assign females on the freed departments they should be displaced from their current department so the ff two lines of code do this
//                 await Department.updateOne({deptID:FemalesWhoWantDept[i].Department},{$pull:{assignedStudents:FemalesWhoWantDept[i].studentId},$inc:{totalAssignedStudents:-1}})
//                 //the ff two lines of code are used to assign females on the freed departments
//                 await Department.updateOne({deptID:dept.deptID},{$push:{assignedStudents:FemalesWhoWantDept[i].studentId},$inc:{totalAssignedStudents:1}})
//                 await Student.updateOne({studentId:FemalesWhoWantDept[i].studentId},{$set:{Department:dept.deptID}})
//                 console.log(chalk.green.bold(`female quota balancing on department ${dept.name} completely done.`))
//             }
//         }
//         //the ff else code is if females count who want dept is greater than the maximum needed females to fill the quota
//         else{
//             const sortedMales = males.sort((a,b)=>{return a.totalScore - b.totalScore})
//             const sortedFemalesWhoWantDept = FemalesWhoWantDept.sort((a,b)=>{return b.totalScore - a.totalScore}) 
//             for(let i=0;i < maxWantedFemales;i++){
//                 //the ff two lines of codes displace the least score males to make the department free to place males 
//                 await Department.updateOne({deptID:dept.deptID},{$pull:{assignedStudents:sortedMales[i].studentId},$inc:{totalAssignedStudents:-1}})
//                 await Student.updateOne({studentId:sortedMales[i].studentId},{$set:{Department:null}})
//                 //since before assign females on the freed departments they should be displaced from their current department so the ff two lines of code do this
//                 if (sortedFemalesWhoWantDept[i].Department !== null && sortedFemalesWhoWantDept[i].Department !== undefined){
//                     await Department.updateOne({deptID:sortedFemalesWhoWantDept[i].Department},{$pull:{assignedStudents:sortedFemalesWhoWantDept[i].studentId},$inc:{totalAssignedStudents:-1}})
//                 }
//                 //the ff two lines of code are used to assign females on the freed departments
//                 await Department.updateOne({deptID:dept.deptID},{$push:{assignedStudents:sortedFemalesWhoWantDept[i].studentId},$inc: {totalAssignedStudents:1}})
//                 await Student.updateOne({studentId:sortedFemalesWhoWantDept[i].studentId},{$set:{Department:dept.deptID}})
//                 console.log(chalk.green.bold(`female quota balancing on department ${dept.name} completely done.`))

//             }
//         }
//     }
// }

// }

//i use the ff async function for sequential execution to prevent concurrency
// GenplacementForFirstSemNatural()
// async function runPlacementforNaturalSem1(){
//     await GenplacementForFirstSemNatural()
    // const departments1 = await Department.find()
    // console.log(departments1)
    // const students1 = await Student.find()
    // console.log(students1)
    // await femaleQuota_AdjustmentForNaturalSem1()
    // await GenplacementForFirstSemNatural() //to reassign males in first semister natural departments who are displaced for female quota adjustment
    // const departments = await Department.find()
    // console.log(departments)
    // const students = await Student.find()
    // console.log(students) 
// }

//  runPlacementforNaturalSem1()
const clearPlacement=async()=>{
    await Student.updateMany({},{$set:{Department:null}})
    await Department.updateMany({},{$set:{assignedStudents:[],totalAssignedStudents:0}})
}  
//clearPlacement()



//next step is assign by checking his preference is from the 6 natural student alternatives  and assign only once one department  for each student by checking department capacity iteratively for each prefence
            //then check female quota of each department iteratively 
            //unsign the last male student from the department and assign for top female among not assigned yet but prefers it untill 20% of female reached or no female need it or for all departments
            //re assign male students who are replaced by female on the department of other their choose which is still not filled





