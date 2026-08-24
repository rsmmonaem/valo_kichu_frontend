const fs = require('fs');

let content = fs.readFileSync('./app/api/fb-capi/route.ts', 'utf8');

// Replace the response status for Facebook Graph API error
content = content.replace(
  /return NextResponse\.json\(\{ error: data \}, \{ status: response\.status \}\);/g,
  '// Return 202 to avoid client-side console spam for non-critical analytics tracking\n      return NextResponse.json({ error: data }, { status: 202 });'
);

// Replace the catch block status
content = content.replace(
  /return NextResponse\.json\(\{ error: error\.message \}, \{ status: 500 \}\);/g,
  '// Return 202 instead of 500 to avoid client-side console spam\n    return NextResponse.json({ error: error.message }, { status: 202 });'
);

fs.writeFileSync('./app/api/fb-capi/route.ts', content);
