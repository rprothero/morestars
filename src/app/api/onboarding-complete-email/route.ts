import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return Response.json({ error: "Missing auth token." }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return Response.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ error: "You must be logged in." }, { status: 401 });
    }

    const body = await request.json();
    const businessId = String(body.businessId || "");

    if (!businessId) {
      return Response.json(
        { error: "Business ID is required." },
        { status: 400 }
      );
    }

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select(
        "id, user_id, business_name, business_slug, notification_email, onboarding_email_sent_at"
      )
      .eq("id", businessId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (businessError || !business) {
      return Response.json({ error: "Business not found." }, { status: 404 });
    }

    if (business.onboarding_email_sent_at) {
      return Response.json({
        ok: true,
        skipped: true,
        reason: "Onboarding email already sent.",
      });
    }

    const notificationEmail = business.notification_email || user.email;

    if (!notificationEmail) {
      return Response.json(
        { error: "No email address found." },
        { status: 400 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const businessName = escapeHtml(business.business_name || "Your Business");
    const reviewUrl = `${appUrl}/r/${business.business_slug}`;
    const dashboardUrl = `${appUrl}/dashboard`;

    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "MoreStars <onboarding@resend.dev>",
      to: notificationEmail,
      subject: "Your MoreStars review system is live",
      html: `
        <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:32px;">
          <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:24px; padding:32px;">
            <div style="font-size:12px; font-weight:800; color:#2563eb; text-transform:uppercase; letter-spacing:0.18em;">
              MoreStars Setup Complete
            </div>

            <h1 style="font-size:32px; line-height:1.1; color:#0f172a; margin:16px 0 8px;">
              ${businessName} is live.
            </h1>

            <p style="font-size:16px; line-height:1.6; color:#475569;">
              Your MoreStars review flow is ready. You can now share your review link, print your QR assets, and start collecting customer feedback.
            </p>

            <div style="margin:24px 0; padding:20px; border-radius:18px; background:#f1f5f9;">
              <div style="font-size:13px; font-weight:800; color:#334155; margin-bottom:8px;">
                Your Review Link
              </div>
              <a href="${reviewUrl}" style="color:#2563eb; font-weight:700; word-break:break-all;">
                ${reviewUrl}
              </a>
            </div>

            <div style="margin:24px 0;">
              <h2 style="font-size:20px; color:#0f172a;">First 3 things to do</h2>
              <ol style="font-size:15px; line-height:1.7; color:#475569; padding-left:20px;">
                <li>Open your MoreStars dashboard.</li>
                <li>Download or print your QR code from the QR Assets Center.</li>
                <li>Place the QR code where happy customers naturally pause.</li>
              </ol>
            </div>

            <a href="${dashboardUrl}" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-weight:800; padding:14px 20px; border-radius:14px;">
              Open Dashboard
            </a>

            <p style="font-size:13px; line-height:1.6; color:#64748b; margin-top:28px;">
              Tip: The QR code works best when your team actively asks happy customers for feedback instead of waiting for customers to notice it on their own.
            </p>

            <div style="font-size:12px; color:#94a3b8; margin-top:28px; border-top:1px solid #e2e8f0; padding-top:18px;">
              Powered by MoreStars.co
            </div>
          </div>
        </div>
      `,
    });

    if (sendError) {
      return Response.json(
        { error: sendError.message || "Email failed to send." },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        onboarding_email_sent_at: new Date().toISOString(),
      })
      .eq("id", business.id)
      .eq("user_id", user.id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 }
    );
  }
}