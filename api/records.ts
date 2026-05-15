import { google } from 'googleapis';

type IncomingBody = {
  profile?: {
    email?: string;
    nickname?: string;
    gender?: string;
    age?: string;
  };
  record?: {
    id?: string;
    mealType?: string;
    foodType?: string;
    beforeMood?: string;
    afterMood?: string;
    bodyFeeling?: string;
    context?: string;
    foodEmoji?: string;
    mbeiCode?: string;
    fortune?: {
      title?: string;
      verse?: string[];
      advice?: string[];
      fortuneType?: string;
    };
  };
};

function validatePayload(body: IncomingBody) {
  const profile = body?.profile;
  const record = body?.record;

  if (!profile || !record) return 'Missing profile or record payload.';

  const requiredProfile = [profile.email, profile.nickname, profile.gender, profile.age];
  if (requiredProfile.some((v) => !v || !String(v).trim())) return 'Missing required profile fields.';

  const requiredRecord = [record.id, record.mealType, record.foodType, record.beforeMood, record.afterMood, record.bodyFeeling, record.mbeiCode];
  if (requiredRecord.some((v) => !v || !String(v).trim())) return 'Missing required record fields.';

  return null;
}

function getSheetsClient() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY_BASE64
    ? Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
    : (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!sheetId || !clientEmail || !privateKey) {
    throw new Error('Missing Google Sheets environment variables.');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return {
    sheetId,
    sheets: google.sheets({ version: 'v4', auth }),
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body: IncomingBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const validationError = validatePayload(body);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const { sheetId, sheets } = getSheetsClient();
    const { profile, record } = body;

    const row = [
      record!.id,
      new Date().toISOString(),
      profile!.email,
      profile!.nickname,
      profile!.gender,
      profile!.age,
      record!.mealType,
      record!.foodType,
      record!.beforeMood,
      record!.afterMood,
      record!.bodyFeeling,
      record!.context ?? '',
      record!.foodEmoji ?? '',
      record!.mbeiCode,
      record!.fortune?.title ?? '',
      record!.fortune?.verse ? record!.fortune.verse.join(' / ') : '',
      record!.fortune?.advice ? record!.fortune.advice.join(' / ') : '',
      record!.fortune?.fortuneType ?? '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'records!A:R',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Google Sheets append failed:', error);
    return res.status(500).json({ error: 'Failed to append record to Google Sheets.' });
  }
}
