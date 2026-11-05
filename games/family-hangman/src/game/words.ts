// Built-in word list: English words up to roughly Korean middle-school level,
// each with its Korean meaning. Written for this app (no external word list
// copied; not checked one-to-one against the national curriculum word list).
// Difficulty comes from the word length (see levelOf in hangman.ts).
// Meanings contain no spaces (the list is split on whitespace).

export type CategoryId =
  | 'animals' | 'food' | 'home' | 'clothes' | 'school' | 'nature' | 'body' | 'people' | 'places' | 'play' | 'colors'
  | 'actions' | 'describe' | 'mind' | 'time' | 'life' | 'basic';

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
  { id: 'clothes', ko: '옷·소지품', en: 'Clothes' },
  { id: 'actions', ko: '움직임·하는 일', en: 'Actions' },
  { id: 'describe', ko: '모양·성질', en: 'Describing' },
  { id: 'mind', ko: '마음·생각', en: 'Feelings & Thinking' },
  { id: 'time', ko: '시간·날짜', en: 'Time' },
  { id: 'life', ko: '생활·사회', en: 'Life & Society' },
  { id: 'basic', ko: '기본 낱말', en: 'Basic Words' },
];

export interface Word {
  w: string; // lowercase a-z only
  ko: string; // Korean meaning
  cat: CategoryId;
}

// "word:뜻" pairs per category, kept compact so the list is easy to review.
const RAW: Partial<Record<CategoryId, string>> = {
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

// Added 2026-11-05: up to middle-school level (family request).
const EXTRA: Partial<Record<CategoryId, string>> = {
  animals:
    'animal:동물 bird:새 insect:곤충 pet:반려동물 tail:꼬리 wing:날개 nest:둥지 camel:낙타 lizard:도마뱀 dinosaur:공룡 ' +
    'mosquito:모기 bug:벌레 worm:지렁이 bat:박쥐·방망이 puppy:강아지 kitten:새끼고양이 hen:암탉 swan:백조 goose:거위 seal:물범 ' +
    'panda:판다 koala:코알라 beetle:딱정벌레 snail:달팽이 dragon:용 crow:까마귀 pigeon:비둘기 sparrow:참새 feather:깃털 fur:털 ' +
    'horn:뿔 shell:껍데기·조개 creature:생물 species:종(생물) cage:우리(동물) ox:황소 rat:쥐(큰쥐) cock:수탉 ostrich:타조',
  food:
    'food:음식 meal:식사 breakfast:아침식사 lunch:점심식사 dinner:저녁식사 snack:간식 salt:소금 sugar:설탕 pepper:후추 oil:기름 ' +
    'meat:고기 beef:소고기 pork:돼지고기 fruit:과일 vegetable:채소 bean:콩 nut:견과 salad:샐러드 steak:스테이크 hamburger:햄버거 ' +
    'sausage:소시지 ham:햄 tea:차(마시는) coffee:커피 drink:마시다·음료 dessert:디저트 sauce:소스 kimchi:김치 flour:밀가루 ' +
    'garlic:마늘 mushroom:버섯 spinach:시금치 lettuce:상추 pea:완두콩 plum:자두 kiwi:키위 mango:망고 recipe:요리법 taste:맛·맛보다 ' +
    'flavor:맛·풍미 menu:메뉴 grain:곡물 wheat:밀 diet:식단 soda:탄산음료 cereal:시리얼 seafood:해산물 toast:토스트 pasta:파스타',
  home:
    'home:집·가정 room:방 floor:바닥·층 wall:벽 ceiling:천장 gate:대문 yard:마당 fence:울타리 shelf:선반 drawer:서랍 closet:옷장 ' +
    'sink:싱크대·가라앉다 stove:난로 oven:오븐 pot:냄비 pan:팬 knife:칼 chopsticks:젓가락 bottle:병 glass:유리·유리잔 trash:쓰레기 ' +
    'broom:빗자루 bucket:양동이 brush:솔·붓 comb:빗 shampoo:샴푸 toothpaste:치약 tissue:휴지 phone:전화 computer:컴퓨터 ' +
    'television:텔레비전 radio:라디오 camera:카메라 battery:배터리 light:빛·가벼운 switch:스위치 button:단추·버튼 lock:자물쇠·잠그다 ' +
    'address:주소 apartment:아파트 furniture:가구 tool:도구 hammer:망치 nail:못·손톱 rope:밧줄 ladder:사다리 machine:기계 ' +
    'heater:난방기 fan:선풍기·팬(지지자) cushion:쿠션 jar:단지 mat:매트 vase:꽃병 garage:차고',
  clothes:
    'clothes:옷 shirt:셔츠 pants:바지 skirt:치마 dress:원피스·옷을입다 coat:외투 jacket:재킷 sweater:스웨터 sock:양말 shoe:신발 ' +
    'boot:부츠 hat:모자 cap:야구모자 glove:장갑 scarf:목도리 belt:허리띠 pocket:주머니 uniform:교복·제복 ring:반지·울리다 ' +
    'necklace:목걸이 watch:손목시계·보다 glasses:안경 wallet:지갑 purse:작은지갑 size:크기 fashion:유행·패션 wear:입다 ' +
    'pajamas:잠옷 vest:조끼 jeans:청바지 sneakers:운동화 sandal:샌들 tie:넥타이·묶다 cotton:면·목화 wool:양털 silk:비단 ' +
    'zipper:지퍼 sleeve:소매 hood:모자(옷에달린) earring:귀걸이 bracelet:팔찌 ',
  school:
    'english:영어 korean:한국어·한국의 subject:과목 grade:학년·성적 exam:시험 quiz:퀴즈 score:점수 report:보고서·보도하다 ' +
    'project:과제 club:동아리 principal:교장 semester:학기 page:쪽 sentence:문장 language:언어 dictionary:사전 textbook:교과서 ' +
    'knowledge:지식 education:교육 paint:페인트·칠하다 geography:지리 example:예 topic:주제 title:제목 poem:시 novel:소설 ' +
    'diary:일기 essay:글·수필 grammar:문법 vocabulary:어휘 practice:연습·연습하다 problem:문제 graduate:졸업하다 lecture:강의 ' +
    'tape:테이프 stapler:스테이플러 locker:사물함 hallway:복도 cafeteria:구내식당 counselor:상담교사 ',
  nature:
    'air:공기 fire:불 ice:얼음 wood:목재·숲 stone:돌 sand:모래 soil:흙 field:들판 valley:골짜기 cave:동굴 coast:해안 wave:파도·흔들다 ' +
    'pond:연못 stream:시내 plant:식물·심다 seed:씨앗 root:뿌리 branch:나뭇가지 bush:덤불 rose:장미 sunflower:해바라기 nature:자연 ' +
    'environment:환경 pollution:오염 energy:에너지 space:우주·공간 universe:우주 sunset:해질녘 sunrise:해돋이 fog:안개 ' +
    'temperature:온도 heat:열·더위 climate:기후 disaster:재난 earthquake:지진 flood:홍수 typhoon:태풍 shadow:그림자 metal:금속 ' +
    'gas:기체·가스 liquid:액체 solid:고체 experiment:실험 recycle:재활용하다 jungle:정글 north:북쪽 south:남쪽 east:동쪽 west:서쪽 ' +
    'continent:대륙 snowman:눈사람 mud:진흙 lightning:번개 dust:먼지 oxygen:산소 gravity:중력 galaxy:은하 ' +
    'resource:자원 harvest:수확 tide:조수 ',
  body:
    'body:몸 health:건강 blood:피 tongue:혀 throat:목구멍 chest:가슴 hip:엉덩이 waist:허리 wrist:손목 muscle:근육 breath:숨 ' +
    'fever:열(병) cough:기침 headache:두통 toothache:치통 medicine:약 pain:통증 hurt:다치게하다·아프다 disease:질병 ' +
    'exercise:운동·운동하다 voice:목소리 smell:냄새·냄새맡다 beard:턱수염 lung:폐 sweat:땀 cold:추운·감기 flu:독감 ' +
    'injury:부상 bandage:붕대 sneeze:재채기하다 forehead:이마 heel:발뒤꿈치 palm:손바닥 skeleton:뼈대 stomachache:복통',
  people:
    'man:남자 woman:여자 boy:소년 girl:소녀 child:아이 children:아이들 kid:아이(어린이) adult:어른 parent:부모 mother:어머니 ' +
    'father:아버지 son:아들 daughter:딸 husband:남편 wife:아내 cousin:사촌 grandmother:할머니 grandfather:할아버지 person:사람 ' +
    'people:사람들 guest:손님 neighbor:이웃 stranger:낯선사람 hero:영웅 captain:선장·주장 soldier:군인 engineer:기술자 ' +
    'lawyer:변호사 judge:판사·판단하다 reporter:기자 designer:디자이너 musician:음악가 actor:배우 chef:요리사(주방장) clerk:점원 ' +
    'waiter:종업원 officer:경찰관·관리 president:대통령·회장 leader:지도자 member:회원 partner:짝·동반자 classmate:반친구 ' +
    'teenager:십대 citizen:시민 human:인간 vet:수의사 owner:주인 customer:고객 tourist:관광객 volunteer:자원봉사자 ' +
    'genius:천재 twin:쌍둥이 couple:부부·한쌍 crowd:군중 enemy:적 expert:전문가 ',
  places:
    'place:장소 street:거리 corner:모퉁이 village:마을(시골) church:교회 temple:절·사원 palace:궁전 tower:탑 building:건물 ' +
    'office:사무실 factory:공장 hotel:호텔 bakery:빵집 store:가게(상점) mall:쇼핑몰 theater:극장 stadium:경기장 gym:체육관 ' +
    'pool:수영장 post:우편·게시하다 port:항구 highway:고속도로 traffic:교통 ticket:표 passenger:승객 travel:여행하다 trip:여행 ' +
    'tour:관광 journey:여정 guide:안내·안내하다 motorcycle:오토바이 elevator:엘리베이터 crosswalk:횡단보도 downtown:시내 ' +
    'entrance:입구 exit:출구 center:중심·센터 hall:복도·홀 cafe:카페 parking:주차 gallery:미술관 aquarium:수족관 ' +
    'pharmacy:약국 bookstore:서점 prison:감옥 border:국경 capital:수도 abroad:해외로 ',
  play:
    'sport:스포츠 hobby:취미 movie:영화 song:노래 concert:콘서트 festival:축제 party:파티 card:카드 match:경기·성냥 player:선수 ' +
    'coach:코치 win:이기다 lose:지다·잃다 prize:상 medal:메달 champion:챔피언 ski:스키 fishing:낚시 hike:도보여행하다 drama:연극·드라마 ' +
    'magic:마술 joke:농담 fun:재미·재미있는 instrument:악기 flute:플루트 band:밴드·띠 cartoon:만화 photo:사진 block:블록·막다 ' +
    'contest:대회 tournament:토너먼트 audience:관객 stage:무대 rhythm:리듬 melody:멜로디 surf:파도타기하다 ' +
    'trophy:트로피 referee:심판 riddle:수수께끼',
  colors:
    'zero:영(0) thirteen:열셋 fourteen:열넷 fifteen:열다섯 sixteen:열여섯 seventeen:열일곱 eighteen:열여덟 nineteen:열아홉 ' +
    'thirty:서른 forty:마흔 fifty:쉰 sixty:예순 seventy:일흔 eighty:여든 ninety:아흔 million:백만 first:첫째 second:둘째·초 ' +
    'third:셋째 half:절반 point:점·요점·가리키다 side:옆·면 edge:가장자리 angle:각도 curve:곡선 pattern:무늬 double:두배의 ' +
    'pair:한쌍 dozen:12개 quarter:4분의1 billion:10억 total:합계 amount:양 sum:합 plus:더하기 minus:빼기 percent:퍼센트',
  actions:
    'go:가다 come:오다 see:보다 look:보다(바라보다) hear:듣다 listen:귀기울여듣다 say:말하다 speak:말하다(연설) talk:이야기하다 ' +
    'tell:말해주다 ask:묻다 call:부르다·전화하다 eat:먹다 make:만들다 do:하다 get:얻다 give:주다 take:가져가다·잡다 bring:가져오다 ' +
    'put:놓다 keep:지키다·유지하다 hold:잡다 carry:나르다 open:열다 close:닫다·가까운 start:시작하다 begin:시작하다 finish:끝내다 ' +
    'stop:멈추다 end:끝·끝나다 walk:걷다 sit:앉다 stand:서다 lie:눕다·거짓말 sleep:자다 wake:깨다 rest:쉬다 wash:씻다 ' +
    'clean:청소하다·깨끗한 help:돕다 love:사랑하다 like:좋아하다 hate:싫어하다 want:원하다 need:필요하다 try:시도하다 use:사용하다 ' +
    'buy:사다 sell:팔다 pay:지불하다 spend:쓰다(돈·시간) save:구하다·저축하다 send:보내다 receive:받다 move:움직이다·이사하다 ' +
    'turn:돌다·차례 push:밀다 pull:당기다 throw:던지다 catch:잡다 kick:차다 hit:치다 drop:떨어뜨리다 fall:떨어지다·가을 ' +
    'fly:날다·파리 climb:오르다 ride:타다 drive:운전하다 arrive:도착하다 leave:떠나다 enter:들어가다 return:돌아오다 visit:방문하다 ' +
    'meet:만나다 wait:기다리다 stay:머무르다 live:살다 die:죽다 grow:자라다 change:바꾸다·변화 build:짓다 break:깨다·휴식 fix:고치다 ' +
    'cut:자르다 draw:그리다 write:쓰다 read:읽다 study:공부하다 learn:배우다 teach:가르치다 spell:철자를말하다 count:세다 add:더하다 ' +
    'choose:고르다 find:찾다 search:검색하다 show:보여주다 hide:숨기다 share:나누다 join:참가하다 follow:따라가다 lead:이끌다 ' +
    'borrow:빌리다 lend:빌려주다 invite:초대하다 thank:감사하다 smile:미소짓다 laugh:웃다 cry:울다 shout:소리치다 sing:노래하다 ' +
    'play:놀다·연주하다 touch:만지다 hug:껴안다 shake:흔들다 fill:채우다 mix:섞다 boil:끓이다 bake:굽다 fry:튀기다 pick:고르다·따다 ' +
    'feed:먹이를주다 hunt:사냥하다 protect:보호하다 fight:싸우다 check:확인하다 prepare:준비하다 explain:설명하다 describe:묘사하다 ' +
    'discuss:토론하다 compare:비교하다 collect:모으다 create:창조하다 develop:발전시키다 improve:개선하다 increase:늘다 reduce:줄이다 ' +
    'produce:생산하다 prevent:막다(예방) solve:풀다·해결하다 happen:일어나다 appear:나타나다 disappear:사라지다 allow:허락하다 ' +
    'avoid:피하다 belong:속하다 breathe:숨쉬다 celebrate:축하하다 complain:불평하다 continue:계속하다 cover:덮다 cross:건너다 ' +
    'deliver:배달하다 design:디자인·설계하다 destroy:파괴하다 discover:발견하다 enjoy:즐기다 express:표현하다 fail:실패하다 ' +
    'succeed:성공하다 hang:걸다 include:포함하다 introduce:소개하다 invent:발명하다 knock:두드리다 marry:결혼하다 miss:그리워하다·놓치다 ' +
    'notice:알아차리다 offer:제안하다 own:소유하다·자신의 pass:지나가다·통과하다 pray:기도하다 print:인쇄하다 raise:들어올리다·기르다 ' +
    'reach:도달하다 relax:휴식하다 repeat:반복하다 reply:답장하다 rescue:구조하다 rise:오르다 roll:구르다 rush:서두르다 set:놓다·세트 ' +
    'shut:닫다 skip:건너뛰다 steal:훔치다 suggest:제안하다(권하다) support:지지하다 survive:살아남다 type:유형·타자치다 vote:투표하다 ' +
    'wrap:포장하다 bite:물다 blow:불다 burn:타다(불)·태우다 chase:뒤쫓다 dig:파다 hurry:서두르다 lift:들어올리다 nod:끄덕이다 ' +
    'escape:탈출하다 gather:모이다 measure:재다 obey:따르다(복종) perform:공연하다 pour:붓다 press:누르다 ' +
    'pretend:~인척하다 remove:제거하다 shine:빛나다 spread:펼치다 sweep:쓸다 tear:찢다·눈물 waste:낭비하다·쓰레기 whisper:속삭이다 ' +
    'attack:공격하다 bow:절하다 copy:베끼다·복사 earn:벌다 feel:느끼다 forgive:용서하다 kneel:무릎꿇다 mark:표시하다 ',
  describe:
    'big:큰 small:작은 large:넓은·큰 little:작은·조금 long:긴 short:짧은·키가작은 tall:키가큰 high:높은 low:낮은 wide:넓은 ' +
    'narrow:좁은 deep:깊은 thick:두꺼운 thin:얇은·마른 heavy:무거운 hot:뜨거운·더운 warm:따뜻한 cool:시원한·멋진 new:새로운 ' +
    'old:오래된·나이든 young:젊은 fast:빠른 slow:느린 quick:재빠른 early:이른 late:늦은 easy:쉬운 hard:어려운·단단한 ' +
    'difficult:어려운 simple:간단한 good:좋은 bad:나쁜 nice:좋은·친절한 great:훌륭한 fine:괜찮은 pretty:예쁜 beautiful:아름다운 ' +
    'cute:귀여운 ugly:못생긴 strong:강한 weak:약한 rich:부유한 poor:가난한 full:가득찬 empty:빈 dirty:더러운 dry:마른(건조한) ' +
    'wet:젖은 quiet:조용한 loud:시끄러운 soft:부드러운 sharp:날카로운 bright:밝은 dark:어두운 sweet:달콤한 sour:신(맛) salty:짠 ' +
    'spicy:매운 bitter:쓴 delicious:맛있는 hungry:배고픈 thirsty:목마른 tired:피곤한 sleepy:졸린 sick:아픈 healthy:건강한 ' +
    'busy:바쁜 free:자유로운·무료의 safe:안전한 dangerous:위험한 important:중요한 famous:유명한 popular:인기있는 special:특별한 ' +
    'different:다른 same:같은 similar:비슷한 real:진짜의 true:사실인 false:거짓의 right:옳은·오른쪽·권리 wrong:틀린 left:왼쪽 ' +
    'correct:정확한 possible:가능한 impossible:불가능한 necessary:필요한 useful:유용한 helpful:도움이되는 careful:조심하는 ' +
    'kind:친절한·종류 polite:예의바른 honest:정직한 brave:용감한 clever:영리한 smart:똑똑한 wise:현명한 foolish:어리석은 lazy:게으른 ' +
    'friendly:친근한 funny:웃긴 strange:이상한 wonderful:멋진 terrible:끔찍한 perfect:완벽한 ready:준비된 sure:확신하는 ' +
    'able:할수있는 alone:혼자 whole:전체의 main:주된 clear:맑은·분명한 sunny:화창한 cloudy:흐린 rainy:비오는 windy:바람부는 ' +
    'snowy:눈오는 round:둥근 flat:평평한 fresh:신선한 cheap:값싼 expensive:비싼 enough:충분한 modern:현대의 ancient:고대의 ' +
    'natural:자연의 public:공공의 private:개인의 traditional:전통적인 national:국가의 local:지역의 foreign:외국의 serious:진지한 ' +
    'calm:침착한 gentle:온화한 amazing:놀라운 interesting:흥미로운 boring:지루한 favorite:가장좋아하는 straight:곧은·똑바로 ' +
    'huge:거대한 tiny:아주작은 fat:뚱뚱한 slim:날씬한 wild:야생의 tight:꽉끼는 loose:헐거운 rough:거친 smooth:매끄러운 ' +
    'pure:순수한 rare:드문 common:흔한 certain:확실한 exact:정확한 general:일반적인 several:몇몇의 various:다양한 ' +
    'equal:같은(동등한) fair:공정한 unique:독특한 excellent:훌륭한(탁월한) awful:끔찍한(지독한) ',
  mind:
    'mind:마음 feeling:감정 happy:행복한 sad:슬픈 angry:화난 glad:기쁜 sorry:미안한 afraid:두려워하는 scared:겁먹은 worry:걱정하다 ' +
    'nervous:긴장한 lonely:외로운 proud:자랑스러운 excited:신난 surprised:놀란 bored:지루해하는 upset:속상한 shy:수줍은 think:생각하다 ' +
    'thought:생각 idea:생각·아이디어 know:알다 understand:이해하다 remember:기억하다 forget:잊다 believe:믿다 trust:신뢰하다 ' +
    'wish:바라다·소원 hope:희망·바라다 dream:꿈·꿈꾸다 plan:계획 decide:결정하다 guess:추측하다 imagine:상상하다 wonder:궁금하다 ' +
    'mean:의미하다 meaning:의미 reason:이유 opinion:의견 agree:동의하다 disagree:반대하다 respect:존경하다 promise:약속·약속하다 ' +
    'mistake:실수 memory:기억 attention:주의 interest:관심 curious:호기심많은 confident:자신있는 courage:용기 fear:두려움 joy:기쁨 ' +
    'peace:평화 secret:비밀 surprise:놀라움·놀라게하다 truth:진실 advice:조언 chance:기회 experience:경험 mood:기분 stress:스트레스 ' +
    'friendship:우정 jealous:질투하는 worried:걱정하는 thankful:고마워하는 honor:명예 pride:자부심 sorrow:슬픔 anger:분노 ' +
    'emotion:감정(정서) prefer:더좋아하다 consider:고려하다 expect:기대하다 realize:깨닫다 recognize:알아보다 doubt:의심 ' +
    'regret:후회하다 suppose:가정하다 attitude:태도 effort:노력 patience:인내 wisdom:지혜 ',
  time:
    'time:시간 day:날·낮 night:밤 morning:아침 afternoon:오후 evening:저녁 noon:정오 midnight:자정 today:오늘 tomorrow:내일 ' +
    'yesterday:어제 week:주 weekend:주말 month:달(월) year:해(년) hour:한시간 minute:분 moment:순간 date:날짜 calendar:달력 ' +
    'birthday:생일 holiday:휴일 vacation:방학·휴가 anniversary:기념일 monday:월요일 tuesday:화요일 wednesday:수요일 ' +
    'thursday:목요일 friday:금요일 saturday:토요일 sunday:일요일 january:1월 february:2월 march:3월·행진하다 april:4월 may:5월·~해도된다 ' +
    'june:6월 july:7월 august:8월 september:9월 october:10월 november:11월 december:12월 past:과거 present:현재·선물 future:미래 ' +
    'century:세기 age:나이·시대 schedule:일정 tonight:오늘밤 period:기간·교시 decade:10년 daily:매일의 weekly:매주의 ' +
    'monthly:매달의 yearly:매년의 dawn:새벽 ',
  life:
    'life:삶 world:세계 country:나라·시골 culture:문화 society:사회 money:돈 price:가격 coin:동전 dollar:달러 cost:비용 bill:계산서 ' +
    'sale:판매·할인 job:직업 work:일·일하다 company:회사 business:사업 meeting:회의 news:뉴스 newspaper:신문 magazine:잡지 ' +
    'internet:인터넷 email:이메일 message:메시지 video:비디오 online:온라인 program:프로그램 website:웹사이트 rule:규칙 law:법 ' +
    'war:전쟁 government:정부 nation:국가 flag:깃발 event:행사·사건 accident:사고 service:서비스 gift:선물 wedding:결혼식 ' +
    'sound:소리 noise:소음 tradition:전통 custom:관습 manner:방식·태도 habit:습관 safety:안전 danger:위험 technology:기술 ' +
    'invention:발명 information:정보 order:주문·순서 shopping:쇼핑 delivery:배달 population:인구 global:세계적인 community:공동체 ' +
    'sign:표지판·서명하다 freedom:자유 duty:의무 election:선거 economy:경제 tax:세금 trade:무역 ' +
    'poverty:가난 charity:자선 army:군대 victory:승리 crime:범죄 fact:사실 ' +
    'data:자료 research:연구 result:결과 success:성공 network:네트워크 smartphone:스마트폰 password:비밀번호 ' +
    'advertise:광고하다 interview:면접·인터뷰 career:경력 salary:월급 budget:예산 rent:집세·빌리다 receipt:영수증 ' +
    'religion:종교 symbol:상징 relationship:관계',
  basic:
    'yes:네 no:아니요 not:아니다 all:모든 some:약간의 any:어떤 many:많은(수) much:많은(양) more:더 most:가장 few:적은 every:모든(각각) ' +
    'each:각각 other:다른 another:또하나의 both:둘다 only:오직 also:또한 too:너무·또한 very:매우 really:정말 always:항상 usually:보통 ' +
    'often:자주 sometimes:때때로 never:결코~않다 again:다시 already:이미 still:여전히 just:단지·방금 even:~조차 almost:거의 maybe:아마 ' +
    'perhaps:아마도 here:여기 there:거기 where:어디 when:언제 what:무엇 who:누구 why:왜 how:어떻게 which:어느 this:이것 that:저것 ' +
    'these:이것들 those:저것들 because:왜냐하면 but:그러나 and:그리고 or:또는 so:그래서 if:만약 though:비록 although:비록~일지라도 ' +
    'before:전에 after:후에 during:동안 until:~까지 since:~이래로 with:함께 without:없이 about:~에대해 above:위에 below:아래에 ' +
    'under:아래에(밑에) over:위에·끝난 between:사이에 among:~사이에(여럿) behind:뒤에 beside:옆에 near:가까이 far:멀리 inside:안에 ' +
    'outside:밖에 into:~안으로 through:~을통해 across:가로질러 along:~을따라 around:주위에 toward:~쪽으로 together:함께 ' +
    'nothing:아무것도 something:무언가 everything:모든것 anything:무엇이든 someone:누군가 everyone:모두 nobody:아무도 ago:~전에 ' +
    'later:나중에 soon:곧 now:지금 then:그때 once:한번 twice:두번 quite:꽤 else:그밖에 instead:대신에 however:하지만 ever:언젠가 ' +
    'yet:아직 away:떨어져서 up:위로 down:아래로 out:밖으로 in:안에 on:위에(붙어) against:~에반대하여 within:~이내에 beyond:~너머 ' +
    'probably:아마도(십중팔구) finally:마침내 suddenly:갑자기 actually:실제로 especially:특히 anyway:어쨌든 ' +
    'somewhere:어딘가에 nowhere:아무데도 whose:누구의 whom:누구를 ',
};

export const WORDS: Word[] = CATEGORIES.map((c) => c.id).flatMap((cat) =>
  `${RAW[cat] ?? ''} ${EXTRA[cat] ?? ''}`
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
