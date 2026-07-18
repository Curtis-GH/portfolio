<?php
/**
 * Contact form backend for the portfolio site.
 *
 * Receives POST data from the #contact-form (see index.html + main.js),
 * validates it server-side, silently discards spam submissions caught by
 * the honeypot field, and sends the message via PHP mail() to the site
 * owner. Responds with JSON so the frontend (main.js) can show a
 * success/error message without a page reload.
 *
 * Hosting note: designed for All-Inkl shared hosting (PHP mail() works
 * out of the box there, no SMTP credentials needed). If mail ever proves
 * unreliable (e.g. landing in spam), switch to SMTP via a mailbox created
 * in the All-Inkl KAS and a library like PHPMailer.
 */

header('Content-Type: application/json; charset=utf-8');

// Only POST is valid; anything else is a misuse of this endpoint.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'method_not_allowed']);
    exit;
}

// --- Recipient -------------------------------------------------------
// Where contact-form messages are delivered.
$recipient = 'duycurtis1997@gmail.com';

// --- Honeypot check ----------------------------------------------------
// Real visitors never see or fill the "website" field (hidden via CSS).
// Bots that fill every field will trip this. Respond as if successful
// so the bot doesn't learn its submission was rejected, but never send
// a real mail.
$honeypot = trim($_POST['website'] ?? '');
if ($honeypot !== '') {
    echo json_encode(['success' => true]);
    exit;
}

// --- Gather + sanitize input -------------------------------------------
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');
$privacy = isset($_POST['privacy']) && $_POST['privacy'] !== '';

// Strip any newlines from single-line fields to prevent email header
// injection (e.g. someone appending "Bcc: ..." into the name field).
$name = str_replace(["\r", "\n"], '', $name);
$email = str_replace(["\r", "\n"], '', $email);

// --- Server-side validation ---------------------------------------------
// Mirrors the client-side checks in main.js — never trust the client alone.
$errors = [];

if ($name === '') {
    $errors[] = 'name';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}
if ($message === '') {
    $errors[] = 'message';
}
if (!$privacy) {
    $errors[] = 'privacy';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'validation', 'fields' => $errors]);
    exit;
}

// --- Compose + send the mail ---------------------------------------------
$subject = 'Portfolio contact form: ' . $name;

$body = "New message from the portfolio contact form:\n\n"
      . "Name: {$name}\n"
      . "Email: {$email}\n\n"
      . "Message:\n{$message}\n";

// From: a fixed address on your own domain (not the visitor's address --
// spoofing the From header with an arbitrary address is what makes mail
// land in spam / get rejected). Reply-To is the visitor's address, so
// hitting "Reply" in your mail client goes straight to them.
$headers = "From: Portfolio Contact <noreply@curtis-nguyen-wellmann.de>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($recipient, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'mail_failed']);
}
