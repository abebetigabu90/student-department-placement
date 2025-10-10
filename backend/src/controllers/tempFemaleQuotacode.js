// export const placementForUnplacedFirstSemNatural = async () => {
//     try {
//         console.log("Starting placement for unplaced Natural Science students...");
        
//         // Find students who need placement
//         const unplacedStudents = await Student.find({
//             stream: { $regex: /^N/i },
//             totalScore: { $exists: true },
//             isAssigned: false
//         });

//         if (unplacedStudents.length === 0) {
//             console.log('No students need placement.');
//             return { message: 'No students to place' };
//         }

//         console.log(`Found ${unplacedStudents.length} students to place`);
        
//         // Sort students by score (highest first)
//         const sortedStudents = unplacedStudents.sort((a, b) => b.totalScore - a.totalScore);
        
//         let placedCount = 0;
//         // Process each student one by one
//         for (const student of sortedStudents) {
//             console.log(`\nProcessing student: ${student.firstName} ${student.middleName}`);
            
//             // Get student's preferences
//             const preferences = await Preference.find({ 
//                 student: student._id 
//             }).sort({ priority: 1 }); // Sort by priority (1st, 2nd, 3rd...)

//             if (preferences.length === 0) {
//                 console.log(`❌ No preferences found for ${student.firstName}`);
//                 continue;
//             }

//             let studentPlaced = false;
//             // Try each preference in order
//             for (const preference of preferences) {
//                 const department = await Department.findById(preference.department);
                
//                 if (!department) {
//                     console.log(`Department not found for preference`);
//                     continue;
//                 }

//                 // Check if department has space
//                 if (department.totalAssignedStudents < department.capacity) {
//                     const updatedDept = await Department.findOneAndUpdate(
//                     { _id: department._id, totalAssignedStudents: { $lt: department.capacity } },
//                     { $inc: { totalAssignedStudents: 1 } },
//                     { new: true } // returns the updated document
//                 );

//                 if (!updatedDept) {
//                     // Department is already full, cannot assign this student
//                     console.log(`Department ${department._id} is full. Student ${student._id} not assigned.`);
//                     continue;
//                 }

//                 // Prepare fields to update on the student
//                 const studentUpdate = {
//                     Department: department._id, // use correct field name (lowercase is typical)
//                     isAssigned: true
//                 };

//                 // If department is engineering, set isEngineering flag
//                 if (updatedDept.deptID === "PreEngineering") {
//                     studentUpdate.isPreEngineering = true;
//                 }
//                 if (updatedDept.deptID === "otherNatura") {
//                     studentUpdate.isOtherNatural = true;
//                 }
//                 if (updatedDept.deptID === "otherSocial") {
//                     studentUpdate.isOtherSocial = true;
//                 }
//                 // Update the student in a single operation
//                 await Student.findByIdAndUpdate(student._id, studentUpdate);
//                 console.log(`✅ Placed ${student.firstName} in ${department.name} (Choice #${preference.priority})`);
//                 placedCount++;
//                 studentPlaced = true;
//                 const placement = new Placement({
//                  student: student._id,
//                  department: department._id,
//                  priority: preference.priority
//                 })
//                 await placement.save();
//                 break; // Stop looking for other preferences
//                 } else {
//                     console.log(`❌ ${department.name} is full`);
//                 }
//             }

//             if (!studentPlaced) {
//                 console.log(`❌ Could not place ${student.firstName} - all preferred departments are full`);
//             }
//         }
//         console.log(`\n🎉 Placement completed!`);
//         console.log(`Total students placed: ${placedCount}`);
//         console.log(`Total students not placed: ${unplacedStudents.length - placedCount}`);

//         return {
//             success: true,
//             placed: placedCount,
//             total: unplacedStudents.length,
//             message: `Placed ${placedCount} out of ${unplacedStudents.length} students`
//         };

//     } catch (error) {
//         console.error('Error during placement:', error);
//         return {
//             success: false,
//             error: error.message
//         };
//     }
// };








        //         try {
        //         // Atomically increment totalAssignedStudents only if department has available capacity
                // const updatedDept = await Department.findOneAndUpdate(
                //     { _id: currentDept._id, totalAssignedStudents: { $lt: currentDept.capacity } },
                //     { $inc: { totalAssignedStudents: 1 } },
                //     { new: true } // returns the updated document
                // );

                // if (!updatedDept) {
                //     // Department is already full, cannot assign this student
                //     console.log(`Department ${currentDept._id} is full. Student ${stu._id} not assigned.`);
                //     continue;
                // }

                // // Prepare fields to update on the student
                // const studentUpdate = {
                //     Department: updatedDept._id, // use correct field name (lowercase is typical)
                //     isAssigned: true
                // };

                // // If department is engineering, set isEngineering flag
                // if (updatedDept.deptID === "PreEngineering") {
                //     studentUpdate.isPreEngineering = true;
                // }
                // if (updatedDept.deptID === "otherNatura") {
                //     studentUpdate.isOtherNatural = true;
                // }
                // if (updatedDept.deptID === "otherSocial") {
                //     studentUpdate.isOtherSocial = true;
                // }
                // // Update the student in a single operation
                // await Student.findByIdAndUpdate(stu._id, studentUpdate);

        //         console.log(`Student ${stu._id} assigned to ${updatedDept._id} successfully.`);

        //     } catch (err) {
        //         console.error(`Error assigning student ${stu._id} to department ${currentDept._id}:`, err);
        //     }
        //         // Create placement
        //         const placement = new Placement({
        //             student: stu._id,
        //             Department: currentDept._id,
        //             priority: pref.priority
        //         });
                
        //         await placement.save();
        //         placementResults.push(placement);
        //         placedCount++;
                
        //         console.log(chalk.green(`Placed student ${stu.studentId} ${stu.firstName} in ${currentDept.name}`));
        //     } else {
        //         console.log(chalk.yellow(`Department ${currentDept.name} is full for student ${stu.studentId}`));
        //     }
        // }

        // console.log(chalk.green.bold(`Successfully placed ${placedCount} students`));
        // return { 
        //     message: `Placement completed - ${placedCount} students placed with priority 1`,
        //     placements: placementResults 
        // };