const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Check file type function
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init single upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('serviceImage'); 

// Init multiple fields upload for site content
const uploadSiteContent = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // Limit file size to 2MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).fields([
    // --- Hero Image Fields (Keep these) ---
    { name: 'home_hero_image', maxCount: 1 },
    { name: 'about_hero_image', maxCount: 1 },
    { name: 'services_hero_image', maxCount: 1 },
    { name: 'articles_hero_image', maxCount: 1 },
    { name: 'contact_hero_image', maxCount: 1 },
    
    // --- NEW: About Us Page Image Fields ---
    { name: 'about_mission_image', maxCount: 1 },
    { name: 'about_vision_image', maxCount: 1 },
    { name: 'about_team_1_image', maxCount: 1 },
    { name: 'about_team_2_image', maxCount: 1 },
    { name: 'about_team_3_image', maxCount: 1 }
]);


module.exports = {
    upload,
    uploadSiteContent
};