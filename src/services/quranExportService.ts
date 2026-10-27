// Quran Export Service: Generates Word (.doc/.docx), PDF-ready printable documents, and Text for any Juz or Surah
import { QuranApiService } from './quranApi';
import { JUZ_NAMES, SURAHS_LIST } from '../data/quranMeta';
import { Ayah } from '../types';

export const QuranExportService = {
  /**
   * Convert number to Arabic-Indic numeral (e.g. 1 -> ١, 25 -> ٢٥)
   */
  toArabicNumeral(num: number): string {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).split('').map(d => arabicDigits[parseInt(d)] || d).join('');
  },

  /**
   * Export any Juz (1..30) as a Word Document (.doc / .docx compatible)
   */
  async exportJuzToWord(juzNumber: number): Promise<void> {
    const juzInfo = JUZ_NAMES[juzNumber - 1] || { juz: juzNumber, name: `الجزء ${juzNumber}` };
    const { ayahs } = await QuranApiService.getJuz(juzNumber);

    if (!ayahs || ayahs.length === 0) {
      throw new Error('لم نتمكن من جلب آيات هذا الجزء في الوقت الحالي.');
    }

    // Group ayahs by surah
    const groupedBySurah = new Map<number, { name: string; ayahs: Ayah[] }>();
    ayahs.forEach(a => {
      if (!groupedBySurah.has(a.surahNumber)) {
        groupedBySurah.set(a.surahNumber, { name: (a as any).surahName || 'سورة', ayahs: [] });
      }
      groupedBySurah.get(a.surahNumber)!.ayahs.push(a);
    });

    let contentHtml = '';
    groupedBySurah.forEach(({ name, ayahs: surahAyahs }, surahNum) => {
      const meta = SURAHS_LIST.find(s => s.id === surahNum);
      const revType = meta?.revelationType || 'مكية';
      const ayahCount = meta?.numberOfAyahs || surahAyahs.length;

      contentHtml += `
        <div style="margin-top: 30px; margin-bottom: 25px; page-break-inside: avoid;">
          <table width="100%" border="0" cellspacing="0" cellpadding="8" style="border: 2px solid #064e3b; background-color: #f0fdf4; border-radius: 8px; margin-bottom: 15px;">
            <tr>
              <td align="center" style="font-size: 18pt; font-weight: bold; color: #064e3b; font-family: 'Amiri', 'Traditional Arabic', serif;">
                ۞ سُورَةُ ${name} ۞
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size: 11pt; color: #166534; font-family: 'Amiri', 'Traditional Arabic', serif;">
                [ ${revType} · آياتها ${ayahCount} ]
              </td>
            </tr>
          </table>

          ${surahNum !== 9 && surahAyahs[0].numberInSurah === 1 ? `
            <div style="text-align: center; font-size: 16pt; font-weight: bold; color: #064e3b; margin: 15px 0 20px 0; font-family: 'Amiri', 'Traditional Arabic', serif;">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
          ` : ''}

          <div style="font-size: 16pt; line-height: 2.3; text-align: justify; text-justify: inter-word; color: #1c1917; font-family: 'Amiri', 'Traditional Arabic', serif;">
      `;

      surahAyahs.forEach(a => {
        let text = a.text;
        // Strip basmalah if present at beginning of non-fatihah first ayah
        if (surahNum !== 1 && a.numberInSurah === 1 && text.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ')) {
          text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
        }

        const arabicNum = this.toArabicNumeral(a.numberInSurah);
        contentHtml += `${text} <span style="color: #064e3b; font-weight: bold; padding: 0 4px;">﴿${arabicNum}﴾</span> `;
      });

      contentHtml += `
          </div>
        </div>
      `;
    });

    const fullWordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>القرآن الكريم - الجزء ${juzNumber} (${juzInfo.name})</title>
        <style>
          @page {
            size: A4;
            margin: 2.5cm 2cm 2.5cm 2cm;
            mso-header-margin: 1.5cm;
            mso-footer-margin: 1.5cm;
          }
          body {
            direction: rtl;
            text-align: right;
            font-family: 'Amiri', 'Traditional Arabic', 'Segoe UI', serif;
            font-size: 15pt;
            line-height: 2.2;
            color: #1c1917;
            background-color: #ffffff;
          }
          .dedication-box {
            border: 1px solid #ca8a04;
            background-color: #fefce8;
            padding: 12px 16px;
            border-radius: 8px;
            text-align: center;
            font-size: 12pt;
            color: #713f12;
            margin-bottom: 25px;
          }
          .doc-header {
            text-align: center;
            border-bottom: 2px solid #064e3b;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <div style="font-size: 24pt; font-weight: bold; color: #064e3b; margin-bottom: 5px;">
            الْقُرْآنُ الْكَرِيمُ
          </div>
          <div style="font-size: 18pt; font-weight: bold; color: #166534;">
            الجزء ${juzNumber}: ${juzInfo.name}
          </div>
        </div>

        <div class="dedication-box">
          <strong>صدقة جارية:</strong> هذا العمل صدقة جارية عن روح والدي المرحوم <strong>سليم بركات</strong>، وأخي المرحوم <strong>محمود سليم بركات</strong>، نسأل الله لهما الرحمة والمغفرة وأن يسكنهما فسيح جناته. نرجو قراءة سورة الفاتحة على روحهما الطاهرة.
        </div>

        ${contentHtml}

        <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e7e5e4; padding-top: 20px; font-size: 11pt; color: #78716c;">
          تم تصدير هذا الجزء المبارك من منصة «نور القرآن الكريم»
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + fullWordHtml], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `القرآن_الكريم_الجزء_${String(juzNumber).padStart(2, '0')}_${juzInfo.name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export any Juz (1..30) as a high-resolution, print-ready PDF document window
   */
  async exportJuzToPDF(juzNumber: number): Promise<void> {
    const juzInfo = JUZ_NAMES[juzNumber - 1] || { juz: juzNumber, name: `الجزء ${juzNumber}` };
    const { ayahs } = await QuranApiService.getJuz(juzNumber);

    if (!ayahs || ayahs.length === 0) {
      throw new Error('لم نتمكن من جلب آيات هذا الجزء في الوقت الحالي.');
    }

    // Group ayahs by surah
    const groupedBySurah = new Map<number, { name: string; ayahs: Ayah[] }>();
    ayahs.forEach(a => {
      if (!groupedBySurah.has(a.surahNumber)) {
        groupedBySurah.set(a.surahNumber, { name: (a as any).surahName || 'سورة', ayahs: [] });
      }
      groupedBySurah.get(a.surahNumber)!.ayahs.push(a);
    });

    let contentHtml = '';
    groupedBySurah.forEach(({ name, ayahs: surahAyahs }, surahNum) => {
      const meta = SURAHS_LIST.find(s => s.id === surahNum);
      const revType = meta?.revelationType || 'مكية';
      const ayahCount = meta?.numberOfAyahs || surahAyahs.length;

      contentHtml += `
        <div class="surah-section">
          <div class="surah-badge-container">
            <div class="surah-frame">
              <div class="surah-title">۞ سُورَةُ ${name} ۞</div>
              <div class="surah-meta">[ ${revType} · آياتها ${ayahCount} ]</div>
            </div>
          </div>

          ${surahNum !== 9 && surahAyahs[0].numberInSurah === 1 ? `
            <div class="basmalah-text">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
          ` : ''}

          <div class="quran-text">
      `;

      surahAyahs.forEach(a => {
        let text = a.text;
        if (surahNum !== 1 && a.numberInSurah === 1 && text.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ')) {
          text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
        }

        const arabicNum = this.toArabicNumeral(a.numberInSurah);
        contentHtml += `${text} <span class="ayah-mark">﴿${arabicNum}﴾</span> `;
      });

      contentHtml += `
          </div>
        </div>
      `;
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بفتح النوافذ المنبثقة لتحميل وطباعة ملف الـ PDF');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>القرآن الكريم - الجزء ${juzNumber} (${juzInfo.name}) - PDF</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 1.8cm 1.5cm 1.8cm 1.5cm;
            @bottom-center {
              content: counter(page);
            }
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Amiri', 'Scheherazade New', serif;
            direction: rtl;
            text-align: justify;
            color: #1c1917;
            background: #ffffff;
            margin: 0;
            padding: 20px;
            font-size: 16pt;
            line-height: 2.3;
          }
          .action-bar {
            position: sticky;
            top: 0;
            background: #064e3b;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: system-ui, sans-serif;
            font-size: 14px;
            z-index: 100;
          }
          .action-btn {
            background: #f59e0b;
            color: #064e3b;
            font-weight: bold;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
          }
          .action-btn:hover {
            background: #d97706;
          }
          .header-banner {
            text-align: center;
            border: 2px solid #064e3b;
            padding: 20px;
            border-radius: 16px;
            background-color: #f0fdf4;
            margin-bottom: 24px;
          }
          .quran-headline {
            font-size: 26pt;
            font-weight: bold;
            color: #064e3b;
            margin-bottom: 4px;
          }
          .juz-headline {
            font-size: 20pt;
            font-weight: bold;
            color: #166534;
          }
          .dedication-card {
            border: 1.5px solid #d97706;
            background: #fffbeb;
            padding: 12px 20px;
            border-radius: 12px;
            text-align: center;
            font-size: 12pt;
            color: #92400e;
            margin-bottom: 25px;
            line-height: 1.8;
          }
          .surah-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .surah-badge-container {
            text-align: center;
            margin-bottom: 16px;
          }
          .surah-frame {
            display: inline-block;
            border: 2px solid #064e3b;
            background: #f0fdf4;
            padding: 10px 30px;
            border-radius: 30px;
            text-align: center;
          }
          .surah-title {
            font-size: 18pt;
            font-weight: bold;
            color: #064e3b;
          }
          .surah-meta {
            font-size: 11pt;
            color: #166534;
          }
          .basmalah-text {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            color: #064e3b;
            margin: 16px 0;
          }
          .quran-text {
            font-size: 16pt;
            line-height: 2.3;
            text-align: justify;
            text-justify: inter-word;
          }
          .ayah-mark {
            color: #064e3b;
            font-weight: bold;
            margin: 0 4px;
          }
          .footer-note {
            text-align: center;
            font-size: 11pt;
            color: #78716c;
            border-top: 1px solid #e7e5e4;
            padding-top: 20px;
            margin-top: 40px;
          }
          @media print {
            .action-bar {
              display: none !important;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="action-bar">
          <div>
            <strong>تصدير كملف PDF:</strong> انقر على زر "حفظ أو طباعة كملف PDF" واختر <em>«حفظ بتنسيق PDF» (Save as PDF)</em>
          </div>
          <button class="action-btn" onclick="window.print()">
            حفظ أو طباعة كملف PDF
          </button>
        </div>

        <div class="header-banner">
          <div class="quran-headline">الْقُرْآنُ الْكَرِيمُ</div>
          <div class="juz-headline">الجزء ${juzNumber}: ${juzInfo.name}</div>
        </div>

        <div class="dedication-card">
          <strong>صدقة جارية:</strong> هذا العمل صدقة جارية عن روح والدي المرحوم <strong>سليم بركات</strong>، وأخي المرحوم <strong>محمود سليم بركات</strong>، نسأل الله لهما الرحمة والمغفرة وأن يسكنهما فسيح جناته. نرجو قراءة سورة الفاتحة على روحهما الطاهرة.
        </div>

        ${contentHtml}

        <div class="footer-note">
          تم التصدير من منصة «نور القرآن الكريم» الشاملة · صدقة جارية
        </div>

        <script>
          // Automatically prompt print dialog after fonts render
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 800);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  },

  /**
   * Export any Juz (1..30) as a clean Plain Text file (.txt)
   */
  async exportJuzToText(juzNumber: number): Promise<void> {
    const juzInfo = JUZ_NAMES[juzNumber - 1] || { juz: juzNumber, name: `الجزء ${juzNumber}` };
    const { ayahs } = await QuranApiService.getJuz(juzNumber);

    let textContent = `القرآن الكريم - الجزء ${juzNumber} (${juzInfo.name})\n`;
    textContent += `صدقة جارية عن روح والدي المرحوم سليم بركات، وأخي المرحوم محمود سليم بركات رحمهما الله\n`;
    textContent += `===================================================================\n\n`;

    let currentSurah = -1;
    ayahs.forEach(a => {
      if (a.surahNumber !== currentSurah) {
        currentSurah = a.surahNumber;
        const meta = SURAHS_LIST.find(s => s.id === currentSurah);
        textContent += `\n\n[ سورة ${meta?.name || a.surahNumber} - ${meta?.revelationType || ''} ]\n`;
        if (currentSurah !== 9 && a.numberInSurah === 1) {
          textContent += `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n`;
        }
      }
      textContent += `${a.text} ﴿${a.numberInSurah}﴾ `;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `الجزء_${String(juzNumber).padStart(2, '0')}_${juzInfo.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
