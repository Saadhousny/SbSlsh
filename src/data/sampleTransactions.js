// Sample transaction CSV data for demo purposes
// In production this comes from the user's Tangerine CSV export
export const SAMPLE_CSV = `Date,Description,Amount,Account
2026-05-15,NETFLIX.COM,-20.99,Chequing
2026-04-15,NETFLIX.COM,-20.99,Chequing
2026-03-15,NETFLIX.COM,-20.99,Chequing
2026-05-10,SPOTIFY USA,-11.99,Chequing
2026-04-10,SPOTIFY USA,-11.99,Chequing
2026-03-10,SPOTIFY USA,-11.99,Chequing
2026-05-01,LINKEDIN *PREMIUM,-49.99,Credit Card
2026-04-01,LINKEDIN *PREMIUM,-49.99,Credit Card
2026-03-01,LINKEDIN *PREMIUM,-49.99,Credit Card
2026-05-20,DUOLINGO PLUS,-9.99,Credit Card
2026-04-20,DUOLINGO PLUS,-9.99,Credit Card
2026-03-20,DUOLINGO PLUS,-9.99,Credit Card
2026-05-18,CANVA PRO,-16.99,Credit Card
2026-04-18,CANVA PRO,-16.99,Credit Card
2026-03-18,CANVA PRO,-16.99,Credit Card
2026-05-05,ADOBE CREATIVE,-54.99,Credit Card
2026-04-05,ADOBE CREATIVE,-54.99,Credit Card
2026-03-05,ADOBE CREATIVE,-54.99,Credit Card
2026-06-01,DROPBOX PLUS,-119.88,Credit Card
2026-05-12,AMAZON PRIME,-9.99,Chequing
2026-04-12,AMAZON PRIME,-9.99,Chequing
2026-03-12,AMAZON PRIME,-9.99,Chequing
2026-05-08,YOUTUBE PREMIUM,-13.99,Credit Card
2026-04-08,YOUTUBE PREMIUM,-13.99,Credit Card
2026-03-08,YOUTUBE PREMIUM,-13.99,Credit Card
2026-05-06,APPLE MUSIC,-10.99,Credit Card
2026-04-06,APPLE MUSIC,-10.99,Credit Card
2026-03-06,APPLE MUSIC,-10.99,Credit Card
2026-05-23,GOODFOOD WEEKLY BOX,-54.00,Chequing
2026-05-16,GOODFOOD WEEKLY BOX,-54.00,Chequing
2026-05-09,GOODFOOD WEEKLY BOX,-54.00,Chequing
2026-05-02,GOODFOOD WEEKLY BOX,-54.00,Chequing
2026-05-22,TIM HORTONS #1234,-4.50,Chequing
2026-05-21,LOBLAWS #5678,-87.32,Chequing
2026-05-20,SHELL GAS STATION,-65.00,Chequing
2026-05-19,SHOPPERS DRUG MART,-23.45,Chequing`

// Sample last-activity memory (in production from Gmail OAuth)
export const SAMPLE_LAST_ACTIVITY = {
  NETFLIX: { daysAgo: 3, detail: 'Watched Stranger Things S4 (May 21)' },
  SPOTIFY: { daysAgo: 0, detail: 'Daily listener — streamed today' },
  LINKEDIN: { daysAgo: 51, detail: 'Last activity email: April 3' },
  DUOLINGO: { daysAgo: 73, detail: 'Last lesson completed: March 12' },
  CANVA: { daysAgo: 23, detail: '2 designs exported (May 1)' },
  ADOBE: { daysAgo: 8, detail: 'Photoshop project saved (May 16)' },
  DROPBOX: { daysAgo: 62, detail: 'Last sync: March 23' },
  AMAZONPRIME: { daysAgo: 5, detail: 'Ordered May 19 (free shipping used)' },
  YOUTUBEPREMIUM: { daysAgo: 1, detail: 'Watched 3 videos yesterday' },
  APPLEMUSIC: { daysAgo: 62, detail: 'No Apple Music listening receipt or app signal since March 23' },
  GOODFOOD: { daysAgo: 36, detail: 'Last recipe box opened from email: April 18' },
}
