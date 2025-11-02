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

// ✅ Example: COR process page
router.get('/cor', (req, res, next) => {
  res.render('kiosk/cor', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_kiosk', { pageTitle: 'COR Process', content: htmlContent });
  });
});

// ✅ Example: Checklist page
router.get('/checklist', (req, res, next) => {
  res.render('kiosk/checklist', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_kiosk', { pageTitle: 'Checklist', content: htmlContent });
  });
});

// ✅ Example: Queue confirmation page
router.get('/queue', (req, res, next) => {
  res.render('kiosk/queue', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_kiosk', { pageTitle: 'Queue Number', content: htmlContent });
  });
});

module.exports = router;
