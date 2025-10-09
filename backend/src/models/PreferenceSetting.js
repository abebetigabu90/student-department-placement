import mongoose from 'mongoose'
const preferenceSettingSchema  = new mongoose.Schema({
    isFirstSemPrefEnabled:{type:Boolean,default:false},
    isSecSemPrefEnabled:{type:Boolean,default:false}
},
 {
  timestamps: true
},
)
export default mongoose.model('PreferenceSetting', preferenceSettingSchema , 'PreferenceSetting');
