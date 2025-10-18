const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files Middleware
app.use(express.static(path.join(__dirname, 'public')));

// --- Root Route  ---
app.get('/', (req, res, next) => {
  res.render('client/home', {}, (err, htmlContent) => {
    if (err) return next(err);

    res.render('layout_client', {
      pageTitle: 'Home Page',
      content: htmlContent
    });
  });
});


// --- ADMIN Route  ---
app.get('/admin/dashboard', (req, res, next) => {
    res.render('admin/dashboard', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /admin/dashboard:", err.message);
            return next(err);
        }
        res.render('layout_admin', {
        pageTitle: 'Admin Dashboard',
        content: htmlContent
        });
    });
});

// --- ADMIN FAQ Route  ---
app.get('/admin/faqs', (req, res, next) => {
    res.render('admin/faqs', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /admin/faqs:", err.message);
            return next(err);
        }
        res.render('layout_admin', {
        pageTitle: 'Admin FAQs',
        content: htmlContent
        });
    });
});

// --- ADMIN Announcement Route  ---
app.get('/admin/announcement', (req, res, next) => {
    res.render('admin/announcement', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /admin/announcement:", err.message);
            return next(err);
        }
        res.render('layout_admin', {
        pageTitle: 'Admin Announcement',
        content: htmlContent
        });
    });
});

// --- ADMIN Announcement Edit Route  ---
app.get('/admin/announcement_edit', (req, res, next) => {
  // Check if the request came from fetch() or an AJAX call
  const isAjax = req.xhr || req.headers.accept.indexOf('json') > -1;

  if (isAjax) {
    // 👉 For JS fetch requests — return only the partial
    res.render('admin/announcement_edit', { layout: false });
  } else {
    // 👉 For normal browser navigation — render with full layout
    res.render('admin/announcement_edit', {}, (err, htmlContent) => {
      if (err) {
        console.error("EJS Rendering Error for /admin/announcement_edit:", err.message);
        return next(err);
      }
      res.render('layout_admin', {
        pageTitle: 'Admin Announcement Edit',
        content: htmlContent
      });
    });
  }
});

// --- ADMIN Site Media Route  ---
app.get('/admin/site_media', (req, res, next) => {
    res.render('admin/site_media', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /admin/site_media:", err.message);
            return next(err);
        }
        res.render('layout_admin', {
        pageTitle: 'Admin Site Media',
        content: htmlContent
        });
    });
});

// --- ADMIN Site Media Video Route ---
app.get('/admin/site_media_video', (req, res, next) => {
    res.render('admin/site_media_video', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /admin/site_media_video:", err.message);
            return next(err);
        }
        res.render('layout_admin', {
        pageTitle: 'Admin Site Media (Video)',
        content: htmlContent
        });
    });
});

// --- ADMIN Site Media Calendar Route ---
app.get('/admin/site_media_calendar', (req, res, next) => {
    res.render('admin/site_media_calendar', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /admin/site_media_calendar:", err.message);
            return next(err);
        }
        res.render('layout_admin', {
        pageTitle: 'Admin Site Media (Calendar)',
        content: htmlContent
        });
    });
});

// // --- ADMIN Site Media Video Route ---
// app.get('/admin/site_media_video', (req, res, next) => {
//   const isAjax = req.xhr || req.headers.accept?.includes('json');

//   if (isAjax) {
//     // 👉 For fetch() or AJAX requests — return only the partial
//     res.render('admin/site_media_video', { layout: false });
//   } else {
//     // 👉 For full browser navigation — render with layout_admin
//     res.render('admin/site_media_video', {}, (err, htmlContent) => {
//       if (err) {
//         console.error("EJS Rendering Error for /admin/site_media_video:", err.message);
//         return next(err);
//       }
//       res.render('layout_admin', {
//         pageTitle: 'Admin Site Media (Video)',
//         content: htmlContent
//       });
//     });
//   }
// });


// // --- ADMIN Site Media Calendar Route ---
// app.get('/admin/site_media_calendar', (req, res, next) => {
//   const isAjax = req.xhr || req.headers.accept?.includes('json');

//   if (isAjax) {
//     // 👉 For fetch() or AJAX requests — return only the partial
//     res.render('admin/site_media_calendar', { layout: false });
//   } else {
//     // 👉 For full browser navigation — render with layout_admin
//     res.render('admin/site_media_calendar', {}, (err, htmlContent) => {
//       if (err) {
//         console.error("EJS Rendering Error for /admin/site_media_calendar:", err.message);
//         return next(err);
//       }
//       res.render('layout_admin', {
//         pageTitle: 'Admin Site Media (Calendar)',
//         content: htmlContent
//       });
//     });
//   }
// });



// --- FAQ Route ---
app.get('/faq', (req, res, next) => {
    // 1. Render the content partial (faq_user_menu.ejs)
    res.render('client/faq_user_menu', {}, (err, htmlContent) => {
        if (err) {
            // Log the error to your console so you can read it
            console.error("EJS Rendering Error for /faq:", err.message); 
            // Send a clear error message back to the browser
            return res.status(500).send("Server Error: Check Console for EJS file error.");
        } 
        
        // 2. Render the final layout
        res.render('layout_client', { 
            pageTitle: "REIGI - FAQ's Menu",
            content: htmlContent 
        });
    });
});


// --- FAQ Enrollment Route ---
app.get('/faq_enrollment_process', (req, res, next) => {
    res.render('client/faq_enrollment_process', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq_enrollment_process:", err.message);
            return next(err);
        }
        res.render('layout_client', {
            pageTitle: "FAQ - Enrollment Process", // Define the title
            content: htmlContent
        });
    });
});

// --- Single FAQ Article Route ---
app.get('/faq-article', (req, res, next) => {
    // 1. Render the content partial (faq_card.ejs)
    res.render('client/faq_card', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq-article:", err.message);
            return next(err);
        }
        // 2. Render the final layout
        res.render('layout_client', {
            pageTitle: "FAQ Article Details", 
            content: htmlContent
        });
    });
});

// --- FAQ Document Request Route ---
app.get('/faq_document_request', (req, res, next) => {
    res.render('client/faq_document_request', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq_document_request:", err.message);
            return next(err);
        }
        res.render('layout_client', {
            pageTitle: "FAQ - Document Request", 
            content: htmlContent
        });
    });
});

// --- FAQ Graduation & Clearance Route ---
app.get('/faq_graduation_clearance', (req, res, next) => {
    res.render('client/faq_graduation_clearance', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq_graduation_clearance:", err.message);
            return next(err);
        }
        res.render('layout_client', {
            pageTitle: "FAQ - Graduation & Clearance", 
            content: htmlContent
        });
    });
});

// --- Announcements Route ---
app.get('/announcement', (req, res, next) => {
    res.render('client/announcement', {}, (err, htmlContent) => {
        if (err) return next(err); 
        res.render('layout_client', { 
            pageTitle: 'Announcements', 
            content: htmlContent 
        });
    });
});

// --- Announcement Article Route ---
app.get('/announcement-article', (req, res, next) => {
    res.render('client/announcement_article', {}, (err, htmlContent) => {
        if (err) return next(err); 
        res.render('layout_client', { 
            pageTitle: 'Announcement Article', 
            content: htmlContent 
        });
    });
});
       

// 6. Server Start
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
