require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Add after your middleware setup
app.use((req, res, next) => {
  res.locals.env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  };
  next();
});

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

// --- ADMIN Login Route  ---
app.get('/admin/login', (req, res, next) => {
  res.render('admin/login', {}, (err, htmlContent) => {
    if (err) {
      console.error("EJS Rendering Error for /admin/login:", err.message);
      return next(err);
    }

    // 👇 Use layout_admin so it includes the ENV script automatically
    res.render('layout_admin', {
      pageTitle: 'Admin Login',
      content: htmlContent
    });
  });
});

// --- ADMIN Login Enter Email Route  ---
app.get('/admin/login_enter_email', (req, res, next) => {
  res.render('admin/login_enter_email', {}, (err, htmlContent) => {
    if (err) {
      console.error("EJS Rendering Error for /admin/login_enter_email:", err.message);
      return next(err);
    }

    // 👇 Use layout_admin so it includes the ENV script automatically
    res.render('layout_admin', {
      pageTitle: 'Admin Login Enter Email',
      content: htmlContent
    });
  });
});

// --- ADMIN Login Reset Route  ---
app.get('/admin/login_reset_password', (req, res, next) => {
  res.render('admin/login_reset_password', {}, (err, htmlContent) => {
    if (err) {
      console.error("EJS Rendering Error for /admin/login_reset_password:", err.message);
      return next(err);
    }

    // 👇 Use layout_admin so it includes the ENV script automatically
    res.render('layout_admin', {
      pageTitle: 'Admin Login Reset Password',
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

// --- ADMIN Site Media Calendar Route ---
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

// --- ADMIN Site Media Calendar Route ---
app.get('/admin/settings', (req, res, next) => {
    res.render('admin/settings', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /admin/settings:", err.message);
            return next(err);
        }
        res.render('layout_admin', {
        pageTitle: 'Admin Settings',
        content: htmlContent
        });
    });
});


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

// --- Log Visitor API --- //
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.post('/api/log-visitor', async (req, res) => {
  try {
    const { visitor_id, device_type } = req.body;
    if (!visitor_id) return res.status(400).json({ error: 'visitor_id is required' });

    const now = new Date();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    // 🔹 Fetch the latest visit for this visitor_id
    const { data: lastVisit, error: fetchError } = await supabase
      .from("visitors")
      .select("*")
      .eq("visitor_id", visitor_id)
      .order("visited_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // 🔹 CASE 1: If no visit yet OR expired for more than 30 minutes → upsert new
    if (
      !lastVisit ||
      (lastVisit.exited_at && now - new Date(lastVisit.exited_at) > THIRTY_MINUTES)
    ) {
      const { error } = await supabase
        .from("visitors")
        .upsert(
          {
            visitor_id,
            device_type,
            visited_at: now.toISOString(),
            exited_at: null
          },
          { onConflict: "visitor_id" }
        );

      if (error) throw error;
      console.log("🆕 New or refreshed visitor session:", visitor_id);
    }
    // 🔹 CASE 2: Still within 30 mins → update exited_at to null (keep same session)
    else {
      const { error } = await supabase
        .from("visitors")
        .update({ exited_at: null })
        .eq("visitor_id", visitor_id);

      if (error) throw error;
      console.log("🔁 Existing active session kept alive:", visitor_id);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error logging visitor:", err.message);
    res.status(500).json({ error: err.message });
  }
});




app.post("/api/visitor-exit", express.text(), async (req, res) => {
  try {
    const body = JSON.parse(req.body || "{}");
    const { visitor_session_id, exited_at } = body;

    console.log(`[Visitor] Exit event received`);
    console.log(`Visitor Session ID: ${visitor_session_id}`);
    console.log(`Exit Time: ${exited_at}`);

    if (!visitor_session_id) {
      return res.status(400).send("Missing visitor ID");
    }

    const { error } = await supabase
      .from("visitors")
      .update({ exited_at })
      .eq("visitor_id", visitor_session_id);

    if (error) {
      console.error("Error updating exit time:", error);
      return res.status(500).send("Error updating exit time");
    }

    // ✅ Respond quickly (important for navigator.sendBeacon)
    res.status(200).send("Exit logged successfully");
  } catch (err) {
    console.error("Invalid exit payload:", err.message);
    res.status(400).send("Invalid data");
  }
});







// 6. Server Start
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
