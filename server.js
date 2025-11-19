require('dotenv').config();
const express = require('express');
const { requireAdminLogin } = require('./middleware/auth');
const path = require('path');
const cookieParser = require('cookie-parser'); 


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cookieParser()); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));

const kioskRoutes = require("./routes/kiosk");
app.use("/kiosk", kioskRoutes);

app.use((req, res, next) => {
  res.locals.env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  };
  next();
});

app.get('/', (req, res, next) => {
  res.render('client/home', {}, (err, htmlContent) => {
    if (err) return next(err);

    res.render('layout_client', {
      pageTitle: 'Home Page',
      content: htmlContent
    });
  });
});

app.get('/admin/login', (req, res, next) => {
  res.render('admin/login', {}, (err, htmlContent) => {
    if (err) {
      console.error("EJS Rendering Error for /admin/login:", err.message);
      return next(err);
    }

    res.render('layout_admin', {
      pageTitle: 'Admin Login',
      content: htmlContent
    });
  });
});

app.get('/admin/login_enter_email', (req, res, next) => {
  res.render('admin/login_enter_email', {}, (err, htmlContent) => {
    if (err) {
      console.error("EJS Rendering Error for /admin/login_enter_email:", err.message);
      return next(err);
    }

    res.render('layout_admin', {
      pageTitle: 'Admin Login Enter Email',
      content: htmlContent
    });
  });
});

app.get('/admin/login_reset_password', (req, res, next) => {
  res.render('admin/login_reset_password', {}, (err, htmlContent) => {
    if (err) {
      console.error("EJS Rendering Error for /admin/login_reset_password:", err.message);
      return next(err);
    }

    res.render('layout_admin', {
      pageTitle: 'Admin Login Reset Password',
      content: htmlContent
    });
  });
});

app.use('/admin', requireAdminLogin);

app.get('/admin/dashboard', (req, res, next) => {
  res.render('admin/dashboard', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_admin', { pageTitle: 'Admin Dashboard', content: htmlContent });
  });
});

app.get('/admin/faqs', (req, res, next) => {
  res.render('admin/faqs', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_admin', { pageTitle: 'Admin FAQs', content: htmlContent });
  });
});

app.get('/admin/kiosk', (req, res, next) => {
  res.render('admin/kiosk', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_admin', { pageTitle: 'Admin Kiosk', content: htmlContent });
  });
});

app.get('/admin/announcement', (req, res, next) => {
  res.render('admin/announcement', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_admin', { pageTitle: 'Admin Announcement', content: htmlContent });
  });
});

app.get('/admin/announcement_edit', (req, res, next) => {
  const isAjax = req.xhr || req.headers.accept.indexOf('json') > -1;
  if (isAjax) {
    res.render('admin/announcement_edit', { layout: false });
  } else {
    res.render('admin/announcement_edit', {}, (err, htmlContent) => {
      if (err) return next(err);
      res.render('layout_admin', { pageTitle: 'Admin Announcement Edit', content: htmlContent });
    });
  }
});

app.get('/admin/site_media', (req, res, next) => {
  res.render('admin/site_media', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_admin', { pageTitle: 'Admin Site Media', content: htmlContent });
  });
});

app.get('/admin/site_media_video', (req, res, next) => {
  res.render('admin/site_media_video', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_admin', { pageTitle: 'Admin Site Media (Video)', content: htmlContent });
  });
});

app.get('/admin/site_media_calendar', (req, res, next) => {
  res.render('admin/site_media_calendar', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_admin', { pageTitle: 'Admin Site Media (Calendar)', content: htmlContent });
  });
});

app.get('/admin/settings', (req, res, next) => {
  res.render('admin/settings', {}, (err, htmlContent) => {
    if (err) return next(err);
    res.render('layout_admin', { pageTitle: 'Admin Settings', content: htmlContent });
  });
});

app.get('/faq', (req, res, next) => {
    res.render('client/faq_user_menu', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq:", err.message); 
            return res.status(500).send("Server Error: Check Console for EJS file error.");
        } 

        res.render('layout_client', { 
            pageTitle: "REIGI - FAQ's Menu",
            content: htmlContent 
        });
    });
});

app.get('/faq_enrollment_process', (req, res, next) => {
    res.render('client/faq_enrollment_process', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq_enrollment_process:", err.message);
            return next(err);
        }
        res.render('layout_client', {
            pageTitle: "FAQ - Enrollment Process",
            content: htmlContent
        });
    });
});

app.get('/faq-article', (req, res, next) => {
    res.render('client/faq_card', {}, (err, htmlContent) => {
        if (err) {
            console.error("EJS Rendering Error for /faq-article:", err.message);
            return next(err);
        }
        res.render('layout_client', {
            pageTitle: "FAQ Article Details", 
            content: htmlContent
        });
    });
});

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

app.get('/announcement', (req, res, next) => {
    res.render('client/announcement', {}, (err, htmlContent) => {
        if (err) return next(err); 
        res.render('layout_client', { 
            pageTitle: 'Announcements', 
            content: htmlContent 
        });
    });
});

app.get('/announcement-article', (req, res, next) => {
    res.render('client/announcement_article', {}, (err, htmlContent) => {
        if (err) return next(err); 
        res.render('layout_client', { 
            pageTitle: 'Announcement Article', 
            content: htmlContent 
        });
    });
});

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post('/api/log-visitor', async (req, res) => {
  try {
    const { visitor_id, device_type } = req.body;
    if (!visitor_id) return res.status(400).json({ error: 'visitor_id is required' });

    const now = new Date();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    const { data: lastVisit, error: fetchError } = await supabase
      .from("visitors")
      .select("*")
      .eq("visitor_id", visitor_id)
      .order("visited_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

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

    res.status(200).send("Exit logged successfully");
  } catch (err) {
    console.error("Invalid exit payload:", err.message);
    res.status(400).send("Invalid data");
  }
});


app.post("/api/set-session", (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: "Missing access token" });
  }

  res.cookie("access_token", access_token, {
  httpOnly: true,
  secure: false,       
  sameSite: "lax",    
  maxAge: 7 * 24 * 60 * 60 * 1000
  });


  console.log("✅ Access token cookie set");
  res.json({ success: true });
});

app.post("/api/update-replay", async (req, res) => {
  try {
    const { visitor_id } = req.body;
    if (!visitor_id) return res.status(400).json({ error: "Missing visitor_id" });

    const { data, error: fetchError } = await supabase
      .from("visitors")
      .select("video_replays")
      .eq("visitor_id", visitor_id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const currentCount = data?.video_replays || 0;
    const newCount = currentCount + 1;

    const { error: updateError } = await supabase
      .from("visitors")
      .upsert(
        { visitor_id, video_replays: newCount },
        { onConflict: "visitor_id" }
      );

    if (updateError) throw updateError;

    console.log(` Visitor ${visitor_id} replay count updated → ${newCount}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating replay count:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/increment-faq-view', async (req, res) => {
  try {
    const { faqId } = req.body;
    if (!faqId) return res.status(400).json({ error: 'faqId is required' });

    const { data: faq, error: fetchError } = await supabase
      .from('faqs')
      .select('views')
      .eq('id', faqId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });

    const newViews = (faq.views || 0) + 1;

    const { error: updateError } = await supabase
      .from('faqs')
      .update({ views: newViews })
      .eq('id', faqId);

    if (updateError) throw updateError;

    res.json({ success: true, newViews });
  } catch (err) {
    console.error('Error incrementing FAQ view:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/queue", async (req, res) => {
  try {
    const { full_name } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: "Full name is required" });
    }

    const { data: lastQueue, error: fetchError } = await supabase
      .from("queue")
      .select("queue_no")
      .order("queue_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const nextNumber = lastQueue ? lastQueue.queue_no + 1 : 1;

    const { data, error: insertError } = await supabase
      .from("queue")
      .insert([{ queue_no: nextNumber, full_name }])
      .select();

    if (insertError) throw insertError;

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("❌ Queue API error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/unlock-window", async (req, res) => {
  const { windowName, tabId } = req.body;

  if (!windowName || !tabId) return res.status(400).json({ error: "Missing windowName or tabId" });

  try {
    const { error } = await supabase
      .from("active_windows")
      .update({ is_active: false, current_tab_id: null })
      .eq("window_name", windowName)
      .eq("current_tab_id", tabId);

    if (error) {
      console.error("Unlock failed:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
