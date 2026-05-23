import re

filepath = 'E:/CloudClick/apps/web/src/app/layout.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import_old = "import { Instrument_Serif, DM_Sans, JetBrains_Mono } from 'next/font/google';"
import_new = """import { 
  Instrument_Serif, DM_Sans, JetBrains_Mono, 
  Plus_Jakarta_Sans, Teko, Bricolage_Grotesque,
  Space_Mono, Inter, Playfair_Display, Archivo_Black, Outfit, Anton, Bebas_Neue
} from 'next/font/google';"""

content = content.replace(import_old, import_new)

definitions_old = """const instrumentSerif = Instrument_Serif({ 
  subsets: ['latin'], 
  style: ['normal', 'italic'],
  weight: '400',
  variable: '--font-instrument-serif'
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono'
});"""

definitions_new = """const instrumentSerif = Instrument_Serif({ subsets: ['latin'], style: ['normal', 'italic'], weight: '400', variable: '--font-instrument-serif' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '700'], variable: '--font-dm-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-jetbrains-mono' });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-plus-jakarta-sans' });
const teko = Teko({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-teko' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-bricolage' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'], weight: ['400', '700'], variable: '--font-playfair' });
const archivoBlack = Archivo_Black({ subsets: ['latin'], weight: ['400'], variable: '--font-archivo-black' });
const outfit = Outfit({ subsets: ['latin'], weight: ['500', '700', '900'], variable: '--font-outfit' });
const anton = Anton({ subsets: ['latin'], weight: ['400'], variable: '--font-anton' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-bebas-neue' });"""

content = content.replace(definitions_old, definitions_new)

body_class_old = "className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-body bg-bg-base text-text-p antialiased`}"
body_class_new = "className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable} ${teko.variable} ${bricolage.variable} ${spaceMono.variable} ${inter.variable} ${playfair.variable} ${archivoBlack.variable} ${outfit.variable} ${anton.variable} ${bebasNeue.variable} font-body bg-bg-base text-text-p antialiased`}"

content = content.replace(body_class_old, body_class_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated fonts in layout.tsx")