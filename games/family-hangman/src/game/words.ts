// Built-in word list: everyday English words a child meets first, each with its
// Korean meaning. Written for this app (no external word list copied).
// Difficulty comes from the word length (see levelOf in hangman.ts).

export type CategoryId = 'animals' | 'food' | 'home' | 'school' | 'nature' | 'body' | 'people' | 'places' | 'play' | 'colors';

export interface Category {
  id: CategoryId;
  ko: string;
  en: string;
}

export const CATEGORIES: Category[] = [
  { id: 'animals', ko: '동물', en: 'Animals' },
  { id: 'food', ko: '음식·과일', en: 'Food' },
  { id: 'home', ko: '집과 물건', en: 'Home' },
  { id: 'school', ko: '학교', en: 'School' },
  { id: 'nature', ko: '자연·날씨', en: 'Nature' },
  { id: 'body', ko: '몸', en: 'Body' },
  { id: 'people', ko: '사람·직업', en: 'People' },
  { id: 'places', ko: '탈것·장소', en: 'Places' },
  { id: 'play', ko: '운동·놀이', en: 'Play' },
  { id: 'colors', ko: '색·모양·숫자', en: 'Colors & Numbers' },
];

export interface Word {
  w: string; // lowercase a-z only
  ko: string; // Korean meaning
  cat: CategoryId;
}

// "word:뜻" pairs per category, kept compact so the list is easy to review.
const RAW: Record<CategoryId, string> = {
  animals:
    'cat:고양이 dog:개 pig:돼지 cow:소 fox:여우 bee:벌 owl:부엉이 ant:개미 bear:곰 duck:오리 fish:물고기 frog:개구리 lion:사자 wolf:늑대 ' +
    'deer:사슴 goat:염소 crab:게 horse:말 sheep:양 mouse:쥐 tiger:호랑이 zebra:얼룩말 snake:뱀 whale:고래 shark:상어 eagle:독수리 ' +
    'rabbit:토끼 monkey:원숭이 turtle:거북 donkey:당나귀 parrot:앵무새 spider:거미 giraffe:기린 penguin:펭귄 dolphin:돌고래 ' +
    'elephant:코끼리 squirrel:다람쥐 kangaroo:캥거루 butterfly:나비 octopus:문어 hamster:햄스터 chicken:닭 gorilla:고릴라',
  food:
    'egg:달걀 pie:파이 jam:잼 rice:밥 milk:우유 cake:케이크 soup:수프 corn:옥수수 pear:배(과일) apple:사과 grape:포도 lemon:레몬 ' +
    'melon:멜론 peach:복숭아 bread:빵 pizza:피자 candy:사탕 honey:꿀 water:물 juice:주스 cheese:치즈 butter:버터 cookie:쿠키 ' +
    'banana:바나나 orange:오렌지 carrot:당근 potato:감자 noodle:국수 tomato:토마토 cherry:체리 onion:양파 sandwich:샌드위치 ' +
    'chocolate:초콜릿 pumpkin:호박 strawberry:딸기 watermelon:수박 pineapple:파인애플 cabbage:양배추 popcorn:팝콘 dumpling:만두 cucumber:오이',
  home:
    'bed:침대 cup:컵 key:열쇠 box:상자 bag:가방 door:문 lamp:전등 sofa:소파 desk:책상 fork:포크 bowl:그릇 soap:비누 roof:지붕 ' +
    'chair:의자 table:탁자 clock:시계 spoon:숟가락 plate:접시 towel:수건 stairs:계단 mirror:거울 pillow:베개 window:창문 ' +
    'carpet:카펫 garden:정원 fridge:냉장고 basket:바구니 candle:양초 blanket:담요 kitchen:부엌 bathroom:욕실 bedroom:침실 ' +
    'curtain:커튼 umbrella:우산 toothbrush:칫솔',
  school:
    'pen:펜 map:지도 art:미술 book:책 glue:풀(붙이는) math:수학 test:시험 word:단어 ruler:자 paper:종이 class:반·수업 music:음악 ' +
    'chalk:분필 story:이야기 eraser:지우개 pencil:연필 crayon:크레용 lesson:수업 letter:편지·글자 answer:대답 friend:친구 number:숫자 ' +
    'picture:그림 science:과학 history:역사 student:학생 library:도서관 question:질문 notebook:공책 homework:숙제 scissors:가위 ' +
    'alphabet:알파벳 backpack:책가방 classroom:교실 playground:운동장 blackboard:칠판',
  nature:
    'sun:해 sky:하늘 sea:바다 moon:달 star:별 rain:비 snow:눈(날씨) wind:바람 tree:나무 leaf:나뭇잎 rock:바위 hill:언덕 lake:호수 ' +
    'river:강 cloud:구름 storm:폭풍 grass:풀(잔디) earth:지구 flower:꽃 forest:숲 island:섬 desert:사막 ocean:대양 spring:봄 summer:여름 ' +
    'autumn:가을 winter:겨울 season:계절 planet:행성 rainbow:무지개 weather:날씨 thunder:천둥 volcano:화산 mountain:산 sunshine:햇빛 waterfall:폭포',
  body:
    'arm:팔 leg:다리(몸) eye:눈(몸) ear:귀 lip:입술 toe:발가락 hand:손 foot:발 nose:코 head:머리 hair:머리카락 face:얼굴 neck:목 ' +
    'knee:무릎 back:등 skin:피부 bone:뼈 chin:턱 mouth:입 tooth:이(치아) heart:심장 thumb:엄지손가락 ankle:발목 cheek:볼 brain:뇌 ' +
    'finger:손가락 elbow:팔꿈치 stomach:배(몸) eyebrow:눈썹 shoulder:어깨',
  people:
    'mom:엄마 dad:아빠 baby:아기 king:왕 aunt:이모·고모 cook:요리사 queen:여왕 nurse:간호사 pilot:조종사 uncle:삼촌 baker:제빵사 ' +
    'doctor:의사 farmer:농부 singer:가수 dancer:무용수 artist:화가 police:경찰 driver:운전사 writer:작가 prince:왕자 sister:언니·누나·여동생 ' +
    'brother:형·오빠·남동생 family:가족 teacher:선생님 dentist:치과의사 grandma:할머니 grandpa:할아버지 princess:공주 scientist:과학자 ' +
    'astronaut:우주비행사 firefighter:소방관',
  places:
    'bus:버스 car:자동차 van:승합차 zoo:동물원 taxi:택시 ship:배(타는) boat:보트 bike:자전거 road:길 city:도시 town:마을 park:공원 ' +
    'shop:가게 bank:은행 farm:농장 train:기차 truck:트럭 plane:비행기 house:집 beach:해변 rocket:로켓 subway:지하철 bridge:다리(건너는) ' +
    'market:시장 school:학교 museum:박물관 castle:성 airport:공항 station:역 tractor:트랙터 hospital:병원 ambulance:구급차 restaurant:식당 helicopter:헬리콥터',
  play:
    'toy:장난감 run:달리다 kite:연 ball:공 game:게임 golf:골프 swim:수영하다 race:경주 doll:인형 drum:북 jump:뛰다 team:팀 goal:골 ' +
    'robot:로봇 skate:스케이트 chess:체스 piano:피아노 swing:그네 slide:미끄럼틀 dance:춤 soccer:축구 tennis:테니스 hockey:하키 ' +
    'puzzle:퍼즐 guitar:기타 violin:바이올린 picnic:소풍 winner:우승자 balloon:풍선 camping:캠핑 baseball:야구 marathon:마라톤 ' +
    'badminton:배드민턴 basketball:농구 volleyball:배구',
  colors:
    'red:빨강 dot:점 one:하나 two:둘 six:여섯 ten:열 blue:파랑 pink:분홍 gray:회색 gold:금색 line:선 oval:타원 four:넷 five:다섯 nine:아홉 ' +
    'green:초록 black:검정 white:하양 brown:갈색 color:색깔 shape:모양 three:셋 seven:일곱 eight:여덟 yellow:노랑 purple:보라 silver:은색 ' +
    'circle:원 square:정사각형 eleven:열하나 twelve:열둘 twenty:스물 hundred:백 diamond:마름모 triangle:삼각형 thousand:천 rectangle:직사각형',
};

export const WORDS: Word[] = (Object.keys(RAW) as CategoryId[]).flatMap((cat) =>
  RAW[cat]
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const i = pair.indexOf(':');
      return { w: pair.slice(0, i), ko: pair.slice(i + 1), cat };
    }),
);

export const WORD_BY_KEY: Record<string, Word> = Object.fromEntries(WORDS.map((w) => [w.w, w]));

export function categoryOf(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
