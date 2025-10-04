// server.js

// 1. Imports at the very top
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 2. View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// 4. Static Files Middleware
app.use(express.static(path.join(__dirname, 'public')));



// --- ADMIN Route (Manual Two-Step Render) ---
app.get('/admin', (req, res, next) => {
    // 1. Render the page-specific content first (admin.ejs)
    res.render('admin', {}, (err, htmlContent) => {
        // Handle any errors during admin.ejs rendering
        if (err) return next(err); 

        // 2. Render the final layout, passing the rendered HTML to the 'content' variable
        res.render('layout', { 
            pageTitle: 'Admin Dashboard', 
            content: htmlContent // <--- THIS is what defines the 'content' variable
        });
    });
});

// --- Root Route (Manual Two-Step Render) ---
app.get('/', (req, res, next) => {
    // 1. Render the page content (views/index.ejs)
    res.render('index', {}, (err, htmlContent) => {
        if (err) return next(err); 
        
        // 2. Render the final layout (views/layout.ejs), passing the content
        res.render('layout', { 
            pageTitle: 'Home Page', // Don't forget the pageTitle variable!
            content: htmlContent 
        });
    });
});

// --- FAQ Route ---
app.get('/faq', (req, res, next) => {
    // 1. Render the content partial (faq_user_menu.ejs)
    res.render('faq_user_menu', {}, (err, htmlContent) => {
        if (err) {
            // Log the error to your console so you can read it
            console.error("EJS Rendering Error for /faq:", err.message); 
            // Send a clear error message back to the browser
            return res.status(500).send("Server Error: Check Console for EJS file error.");
        } 
        
        // 2. Render the final layout
        res.render('layout', { 
            pageTitle: "REIGI - FAQ's Menu",
            content: htmlContent 
        });
    });
});


// --- FAQ Enrollment Route ---
app.get('/faq_enrollment_process', (req, res, next) => {
    res.render('faq_enrollment_process', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq_enrollment_process:", err.message);
            return next(err);
        }
        res.render('layout', {
            pageTitle: "FAQ - Enrollment Process", // Define the title
            content: htmlContent
        });
    });
});

// --- Single FAQ Article Route (e.g., /faq-article?id=123) ---
app.get('/faq-article', (req, res, next) => {
    // 1. Render the content partial (faq_card.ejs)
    res.render('faq_card', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq-article:", err.message);
            return next(err);
        }
        // 2. Render the final layout
        res.render('layout', {
            pageTitle: "FAQ Article Details", // This will be updated by JS, but set a default
            content: htmlContent
        });
    });
});

// --- FAQ Document Request Route ---
app.get('/faq_document_request', (req, res, next) => {
    res.render('faq_document_request', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq_document_request:", err.message);
            return next(err);
        }
        res.render('layout', {
            pageTitle: "FAQ - Document Request", // Define the title
            content: htmlContent
        });
    });
});

// --- FAQ Graduation & Clearance Route ---
app.get('/faq_graduation_clearance', (req, res, next) => {
    res.render('faq_graduation_clearance', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq_graduation_clearance:", err.message);
            return next(err);
        }
        res.render('layout', {
            pageTitle: "FAQ - Graduation & Clearance", // Define the title
            content: htmlContent
        });
    });
});

// --- Announcements Route ---
app.get('/announcements', (req, res, next) => {
    res.render('announcement', {}, (err, htmlContent) => {
        if (err) return next(err); 
        res.render('layout', { 
            pageTitle: 'Announcements', 
            content: htmlContent 
        });
    });
});

// 6. Server Start
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
