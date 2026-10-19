import type { Board, Exp, Model } from './types';
import img4946116 from '../img/4946116-big.jpeg';
import img5269573 from '../img/5269573-big.jpeg';
import img5303682 from '../img/5303682-big.jpeg';
import img5303692 from '../img/5303692-big.jpeg';
import img5303693 from '../img/5303693-big.jpeg';
import img5303696 from '../img/5303696-big.jpeg';
import img5640733 from '../img/5640733-big.jpeg';
import img5640737 from '../img/5640737-big.jpeg';
import img5697998 from '../img/5697998-big.jpeg';
import img5698400 from '../img/5698400-big.jpeg';
import img6085715 from '../img/6085715-big.jpeg';
import img6085716 from '../img/6085716-big.jpeg';
import img6162641 from '../img/6162641-big.jpeg';
import img6162643 from '../img/6162643-big.jpeg';
import img6162662 from '../img/6162662-big.jpeg';
import img6162708 from '../img/6162708-big.jpeg';
import img6162722 from '../img/6162722-big.jpeg';
import img6162723 from '../img/6162723-big.jpeg';
import img6372292 from '../img/6372292-big.jpeg';
import img6372295 from '../img/6372295-big.jpeg';
import img6809155 from '../img/6809155-big.jpeg';
import img6914348 from '../img/6914348-big.jpeg';
import img6914357 from '../img/6914357-big.jpeg';
import img6986363 from '../img/6986363-big.jpeg';
import img6986364 from '../img/6986364-big.jpeg';
import img6986370 from '../img/6986370-big.jpeg';
import img7050851 from '../img/7050851-big.jpeg';
import img7050854 from '../img/7050854-big.jpeg';
import img7050861 from '../img/7050861-big.jpeg';
import img7151347 from '../img/7151347-big.jpeg';
import img7151351 from '../img/7151351-big.jpeg';
import img7376508 from '../img/7376508-big.jpeg';
import img7376529 from '../img/7376529-big.jpeg';
import img7376536 from '../img/7376536-big.jpeg';
import img7533110 from '../img/7533110-big.jpeg';
import img7533112 from '../img/7533112-big.jpeg';
import img8630330 from '../img/8630330-big.jpeg';
import img8630336 from '../img/8630336-big.jpeg';
import img8630337 from '../img/8630337-big.jpeg';
import img8630340 from '../img/8630340-big.jpeg';
import img8716047 from '../img/8716047-big.jpeg';
import img8716048 from '../img/8716048-big.jpeg';
import img8744587 from '../img/8744587-big.jpeg';
import img8758044 from '../img/8758044-big.jpeg';
import img8758045 from '../img/8758045-big.jpeg';
import img8758046 from '../img/8758046-big.jpeg';
import img8758047 from '../img/8758047-big.jpeg';

const PORTFOLIO_IMAGES = [
  img4946116, img5269573, img5303682, img5303692, img5303693, img5303696,
  img5640733, img5640737, img5697998, img5698400, img6085715, img6085716,
  img6162641, img6162643, img6162662, img6162708, img6162722, img6162723,
  img6372292, img6372295, img6809155, img6914348, img6914357, img6986363,
  img6986364, img6986370, img7050851, img7050854, img7050861, img7151347,
  img7151351, img7376508, img7376529, img7376536, img7533110, img7533112,
  img8630330, img8630336, img8630337, img8630340, img8716047, img8716048,
  img8744587, img8758044, img8758045, img8758046, img8758047,
];

export const CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Cox’s Bazar', 'Barishal', 'Rangpur', 'Mymensingh'];
export const BOARDS: Board[] = ['Women', 'Men', 'Curve'];
export const FILTERS = ['All', 'Women', 'Men', 'Curve', 'New Faces'];
export const HAIR = ['Black', 'Dark brown', 'Brown', 'Auburn', 'Blonde', 'Grey', 'Shaved'];
export const EYES = ['Dark brown', 'Brown', 'Hazel', 'Green', 'Blue', 'Grey'];
export const LANGS = ['Bangla', 'English', 'Hindi', 'Urdu', 'Sylheti', 'Chittagonian', 'Arabic', 'French'];
export const KINDS = ['Runway', 'Editorial', 'Commercial / TVC', 'Catalogue', 'Brand campaign', 'Music video', 'Film / Theatre'];
export const MAXP = 8;

/** [key, label, hint, required] */
export const SLOTS: [string, string, string, boolean][] = [
  ['headshot', 'Headshot', 'Natural light, no makeup, hair back.', true],
  ['full', 'Full length', 'Fitted clothes, straight on.', true],
  ['profile', 'Profile', 'Side view, shoulders square.', false],
  ['smile', 'Smile', 'Close-up with a smile.', false],
  ['extra', 'Extra look', 'Any recent professional shot.', false],
];

export const STEPS = ['Basics', 'Measurements', 'Photos', 'Work & contact', 'Review'];

export const PAL: string[][] = [
  ['#3B0F1A', '#8C2F39', '#E8A87C'], ['#0F2A3A', '#1F5F74', '#9ED0C9'], ['#2B2A12', '#6B6B2A', '#E3D18A'], ['#1B1340', '#4B3A9B', '#C7B6F2'],
  ['#2A1A12', '#7A4A2B', '#F0C9A0'], ['#0E2E23', '#1E6B4F', '#BDE8CE'], ['#3A1634', '#8A3B7D', '#F3C0E6'], ['#1A1F2B', '#3F5575', '#C9D6EA'],
];

export const SKIN = ['#C58C65', '#A8704D', '#8D5A3B', '#D9A77F', '#B07A55'];
export const HAIRC: Record<string, string> = {
  Black: '#15100E', 'Dark brown': '#2A1B14', Brown: '#4A2E1E', Auburn: '#7A3A22', Blonde: '#C9A36A', Grey: '#9A9A9A', Shaved: '#2A211C',
};

const EXPP: [string, number, string][][] = [
  [['Eid collection lookbook, apparel label', 2026, 'Catalogue'], ['Bridal runway, Dhaka', 2025, 'Runway'], ['Lifestyle magazine cover story', 2025, 'Editorial']],
  [['Telecom brand TVC', 2026, 'Commercial / TVC'], ['Festival campaign, jewellery house', 2025, 'Brand campaign']],
  [['Menswear showcase, Dhaka', 2025, 'Runway'], ['Denim catalogue shoot', 2024, 'Catalogue'], ['Music video, lead role', 2024, 'Music video']],
  [['Winter collection editorial', 2026, 'Editorial'], ['Skincare brand campaign', 2025, 'Brand campaign'], ['Fashion week runway, Dhaka', 2024, 'Runway']],
];

type Raw = [string, string, Board, string, number, number, number, number, number, number, string, string, string, string, string, number];

const RAW: Raw[] = [
  ['tahmina-rahi', 'Tahmina Rahi', 'Women', 'Dhaka', 22, 176, 82, 60, 89, 39, 'Black', 'Dark brown', 'Bangla,English', 'tahmina.rahi', 'Editorial and runway model with a quiet, sculptural look. Comfortable on long show days and tight studio schedules.', 0],
  ['arif-chowdhury', 'Arif Chowdhury', 'Men', 'Chattogram', 25, 185, 98, 76, 94, 43, 'Black', 'Dark brown', 'Bangla,English,Hindi', 'arif.chowdhury', 'Commercial and runway work across menswear, denim and lifestyle. Travels from Chattogram on short notice.', 2],
  ['sabrina-noor', 'Sabrina Noor', 'Women', 'Dhaka', 24, 174, 84, 61, 90, 39, 'Dark brown', 'Brown', 'Bangla,English', 'sabrina.noor', 'Known for warm, natural beauty campaigns and festive collections. Easy to direct and quick on set.', 3],
  ['ishrat-lamia', 'Ishrat Lamia', 'Curve', 'Dhaka', 27, 172, 102, 81, 110, 40, 'Black', 'Dark brown', 'Bangla,English', 'ishrat.lamia', 'Curve model working in bridal, saree and lifestyle campaigns. Confident on camera and on the runway.', 0],
  ['rafi-mahmud', 'Rafi Mahmud', 'Men', 'Sylhet', 23, 183, 96, 75, 92, 43, 'Dark brown', 'Hazel', 'Bangla,English,Sylheti', 'rafi.mahmud', 'Lean frame, strong profile. Equally at ease in tailoring and streetwear.', 2],
  ['anika-sultana', 'Anika Sultana', 'Women', 'Dhaka', 20, 177, 81, 59, 88, 40, 'Black', 'Dark brown', 'Bangla,English', 'anika.sultana', 'Recently signed. Building a first portfolio across editorial and catalogue work.', -1],
  ['nafis-karim', 'Nafis Karim', 'Men', 'Dhaka', 21, 186, 97, 74, 93, 44, 'Black', 'Brown', 'Bangla,English', 'nafis.karim', 'Recently signed. Athletic build, strong on camera, open to commercial and fitness work.', -1],
  ['mehzabin-tisha', 'Mehzabin Tisha', 'Curve', 'Chattogram', 26, 170, 100, 79, 108, 39, 'Auburn', 'Brown', 'Bangla,English,Hindi', 'mehzabin.tisha', 'Catalogue and brand campaign specialist with a bright, easy presence.', 1],
  ['shuvo-barua', 'Shuvo Barua', 'Men', 'Rangpur', 24, 182, 95, 73, 91, 42, 'Black', 'Dark brown', 'Bangla,English', 'shuvo.barua', 'Editorial and music video experience. Calm, reliable and quick to take direction.', 2],
  ['raisa-tabassum', 'Raisa Tabassum', 'Women', 'Khulna', 23, 175, 83, 60, 89, 39, 'Black', 'Hazel', 'Bangla,English,Urdu', 'raisa.tabassum', 'Runway-first model with experience across Dhaka fashion shows and festive campaigns.', 3],
  ['farhan-hossain', 'Farhan Hossain', 'Men', 'Dhaka', 22, 184, 97, 75, 93, 43, 'Dark brown', 'Dark brown', 'Bangla,English', 'farhan.hossain', 'Recently signed. Clean, classic look suited to commercial, TVC and catalogue.', -1],
  ['nusrat-zerin', 'Nusrat Zerin', 'Curve', 'Rajshahi', 25, 171, 101, 80, 109, 40, 'Black', 'Dark brown', 'Bangla,English', 'nusrat.zerin', 'Curve model for beauty, apparel and festive campaigns. Based in Rajshahi, travels to Dhaka for jobs.', 1],
];

export const SAMPLE: Model[] = RAW.map((r, i) => {
  const ex: Exp[] = r[15] < 0 ? [] : EXPP[r[15]].map((x) => ({ c: x[0], y: x[1], k: x[2] }));
  return {
    id: r[0], name: r[1], board: r[2], city: r[3], age: r[4], h: r[5], bust: r[6], waist: r[7], hips: r[8], shoe: r[9],
    hair: r[10], eyes: r[11], langs: r[12].split(','), ig: r[13], bio: r[14], exp: ex,
    photos: {},
    portfolio: PORTFOLIO_IMAGES.filter((_, imageIndex) => imageIndex % RAW.length === i).map((image) => image.src),
    pal: PAL[i % PAL.length], seed: i + 1, isNew: r[15] < 0, mine: false,
  };
});
