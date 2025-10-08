import mongoose from "mongoose";
import XLSX from "xlsx";
import Student from './models/student.js';

const MONGO_URI = "mongodb://127.0.0.1:27017/student-placement";

const importStudents = async () => {
  try {
    // 1. Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // 2. Read Excel file
    console.log("Reading Excel file...");
    const workbook = XLSX.readFile("studentsMassData.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`Found ${jsonData.length} students in Excel file`);

    // 3. Process data
    const students = [];
    let errorCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // +2 for header row and 0-based index

      try {
        // Check required fields (all except middleName and lastName)
        if (!row.firstname) {
          throw new Error("Missing firstname");
        }
          if (!row.middlename) {
          throw new Error("Missing middlename");
        }
        if (!row.IDNo) {
          throw new Error("Missing student ID");
        }
        if (!row.region) {
          throw new Error("Missing region");
        }
        if (!row.Stream) {
          throw new Error("Missing stream");
        }
        if (!row.Gender) {
          throw new Error("Missing gender");
        }
        if (!row.GPA) {
          throw new Error("Missing GPA");
        }
        if (!row.G12) {
          throw new Error("Missing entrance score (G12)");
        }
        if (!row.Total70) {
          throw new Error("Missing total score");
        }

        // Create student object with exact data
        const student = {
          firstName: row.firstname,
          middleName: row.middlename, // optional - no substitution
          lastName: row.lastName||"",     // optional - no substitution
          studentId: row.IDNo,
          region: row.region,
          stream: row.Stream,
          gender: row.Gender,
          gpa: row.GPA,
          entranceScore: row.G12,
          totalScore: row.Total70,
          password: row.middlename + "123" // will fail if middlename is undefined
        };

        students.push(student);
        
      } catch (error) {
        console.log(`❌ Row ${rowNumber} error: ${error.message}`);
        errorCount++;
      }
    }

    // 4. Insert into database
    console.log(`Importing ${students.length} students...`);
    
    if (students.length > 0) {
      await Student.insertMany(students);
      console.log(`✅ Successfully imported ${students.length} students`);
    }

    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} records had errors and were skipped`);
    }

    console.log("✅ Import completed!");
    process.exit(0);

  } catch (error) {
    console.log("❌ Import failed:", error.message);
    process.exit(1);
  }
};

importStudents();