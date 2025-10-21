import Student from '../models/student.js';
import Department from '../models/Department.js';
import Preference from '../models/preferences.js'
import Placement from '../models/Placement.js'
import chalk from 'chalk'
const clearPlacements = async () => {
    try {
        console.log(chalk.yellow.bold('🧹 Quick clearing all placements...'));
        
        await Promise.all([
            // Reset all students
            Student.updateMany(
                {}, 
                { 
                    $set: { 
                        Department: null, 
                        isAssigned: false,
                        isEngineering: false,
                        isOtherNatural: false,
                        isOtherSocial: false
                    } 
                }
            ),
            // Reset all departments
            Department.updateMany(
                {}, 
                { $set: { totalAssignedStudents: 0 } }
            ),
            // Delete all placements
            Placement.deleteMany({}),
            //Delete all preferences
            Preference.deleteMany({})
            
        ]);

        console.log(chalk.green.bold('✅ All placements and Preferences cleared!'));
        return { success: true, message: 'All placements and Preferences cleared' };

    } catch (error) {
        console.error(chalk.red.bold('❌ Clear error:'), error);
        return { success: false, error: error.message };
    }
};
export default clearPlacements