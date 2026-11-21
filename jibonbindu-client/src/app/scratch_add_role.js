const fs = require('fs');
const p = 'D:/Shammi/IDB/FinalProject/JibonBindu/JibonbinduAPI/SharedLibrary/Constants/AppConstants.cs';
let c = fs.readFileSync(p, 'utf8');
if (!c.includes('MemberRequest')) {
  const old = 'public const string NewDonorRegistered = "NewDonorRegistered";';
  const rep = 'public const string NewDonorRegistered = "NewDonorRegistered";\r\n        public const string MemberRequest = "MemberRequest";';
  c = c.replace(old, rep);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Added MemberRequest');
} else {
  console.log('Already present');
}
