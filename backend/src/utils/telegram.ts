/**
 * Sends the review team a message when a student asks us to check something.
 *
 * Telegram rather than email: no SMTP, domain or deliverability setup, it is
 * what the team already uses, and a group chat means whoever is free can pick
 * a request up. One HTTPS POST, no dependency.
 *
 * Note this is one-directional. A Telegram bot cannot message a user who has
 * not messaged it first, which is why the *student's* answer goes to their
 * in-app inbox instead.
 *
 * Disabled unless TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set — the app
 * runs perfectly well without it.
 */

const TOKEN = () => process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = () => process.env.TELEGRAM_CHAT_ID;

export const isTelegramConfigured = (): boolean => Boolean(TOKEN() && CHAT_ID());

/** Telegram's MarkdownV2 reserves these; escape before interpolating. */
const escape = (value: string): string =>
  value.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, m => `\\${m}`);

/**
 * Best-effort: never throws and never blocks the caller's response. A failed
 * notification must not fail a student's submission — the request is already
 * saved and visible in the admin queue regardless.
 */
export const notifyTeam = async (text: string): Promise<boolean> => {
  if (!isTelegramConfigured()) return false;
  if (process.env.NODE_ENV === 'test') return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID(),
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      console.error('Telegram notification failed:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('Telegram notification error:', err instanceof Error ? err.message : err);
    return false;
  }
};

export interface RequestAlert {
  id: number;
  title: string;
  url: string | null;
  note: string | null;
  riskLevel: string;
  findings: string[];
  submittedBy: string;
}

const RISK_ICON: Record<string, string> = {
  high: '🔴',
  caution: '🟠',
  low: '🟢'
};

/** Formats and sends the "new request" alert. */
export const notifyNewRequest = async (alert: RequestAlert): Promise<boolean> => {
  const icon = RISK_ICON[alert.riskLevel] ?? '⚪';

  const lines = [
    `${icon} *New verification request \\#${alert.id}*`,
    '',
    `*What:* ${escape(alert.title)}`,
    alert.url ? `*Link:* ${escape(alert.url)}` : '*Link:* none given',
    `*From:* ${escape(alert.submittedBy)}`,
    `*Auto\\-check:* ${escape(alert.riskLevel)}`
  ];

  if (alert.note) lines.push(`*They said:* ${escape(alert.note)}`);

  if (alert.findings.length > 0) {
    lines.push('', '*Flags:*');
    for (const finding of alert.findings.slice(0, 5)) lines.push(`• ${escape(finding)}`);
  }

  return notifyTeam(lines.join('\n'));
};
