// Vercel serverless entrypoint — wraps Express from ../server.js.
// server.js skips .listen() when VERCEL=1 is set; we just module.exports the app.
//
// CRITICAL: the explicit fs.readFileSync calls below exist purely to make
// Vercel's NFT static-tracer bundle the legacy HTML files into the function.
// Without them, every Express res.sendFile(__dirname + "/X.html") crashes
// with ENOENT because NFT can't follow dynamic paths.

const fs = require("fs");

try { fs.readFileSync(__dirname + "/../index.html"); } catch {}
try { fs.readFileSync(__dirname + "/../signup.html"); } catch {}
try { fs.readFileSync(__dirname + "/../login.html"); } catch {}
try { fs.readFileSync(__dirname + "/../contact.html"); } catch {}
try { fs.readFileSync(__dirname + "/../founderstory.html"); } catch {}
try { fs.readFileSync(__dirname + "/../ourstory.html"); } catch {}
try { fs.readFileSync(__dirname + "/../team.html"); } catch {}
try { fs.readFileSync(__dirname + "/../whyempresshealth.html"); } catch {}
try { fs.readFileSync(__dirname + "/../membershipoptions.html"); } catch {}
try { fs.readFileSync(__dirname + "/../membershipsurvey.html"); } catch {}
try { fs.readFileSync(__dirname + "/../howitworks.html"); } catch {}
try { fs.readFileSync(__dirname + "/../askempress.html"); } catch {}
try { fs.readFileSync(__dirname + "/../faq.html"); } catch {}
try { fs.readFileSync(__dirname + "/../privacypolicy.html"); } catch {}
try { fs.readFileSync(__dirname + "/../cookies.html"); } catch {}
try { fs.readFileSync(__dirname + "/../accessibility.html"); } catch {}
try { fs.readFileSync(__dirname + "/../market.html"); } catch {}
try { fs.readFileSync(__dirname + "/../betacomingsoon.html"); } catch {}
try { fs.readFileSync(__dirname + "/../betaversion.html"); } catch {}
try { fs.readFileSync(__dirname + "/../dom.html"); } catch {}
try { fs.readFileSync(__dirname + "/../supplements.html"); } catch {}
try { fs.readFileSync(__dirname + "/../skincare.html"); } catch {}
try { fs.readFileSync(__dirname + "/../haircare.html"); } catch {}
try { fs.readFileSync(__dirname + "/../selfcaretools.html"); } catch {}
try { fs.readFileSync(__dirname + "/../bundlesandkits.html"); } catch {}
try { fs.readFileSync(__dirname + "/../menopausemonth.html"); } catch {}
try { fs.readFileSync(__dirname + "/../events.html"); } catch {}
try { fs.readFileSync(__dirname + "/../expertblogs.html"); } catch {}
try { fs.readFileSync(__dirname + "/../expertguidance.html"); } catch {}
try { fs.readFileSync(__dirname + "/../ebookguides.html"); } catch {}
try { fs.readFileSync(__dirname + "/../wellnesshub.html"); } catch {}
try { fs.readFileSync(__dirname + "/../symptomsupport.html"); } catch {}
try { fs.readFileSync(__dirname + "/../communitystories.html"); } catch {}
try { fs.readFileSync(__dirname + "/../community.html"); } catch {}
try { fs.readFileSync(__dirname + "/../dailyaffirmations.html"); } catch {}

module.exports = require("../server.js");
