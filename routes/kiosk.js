const express = require('express');
const router = express.Router();

// --- Kiosk Home Page ---
router.get("/", (req, res, next) => {
  res.render("kiosk/index", {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render("layout_kiosk", {
      pageTitle: "URS Kiosk",
      content: htmlContent
    });
  });
});

module.exports = router;
