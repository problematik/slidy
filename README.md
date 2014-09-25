Slidy
==

###Delo z izdatki

Vsak poimenovani izdatek dobi svoj drsnik.
Drsniku lahko nastaviš razpon, polmer, korak ter barvo.

Vsak izdatek lahko prilagodiš tako, da klikneš na drsnik. Ko klikneš na drsnik se izdatek za drsnik postavi v ospredje (ostali se začasno skrijejo), tako da lahko začneš z nastavljanjem vrednosti.

Z miškinim/prstnim potegom lahko nastavljaš vrednost, s klikom na krožnico drsnika pa vrednost premikaš za korak.
Po določenem času po zadnji interakciji s canvasom (glej [Parametri - editModeTimeout](#atributi)) se na sredini drsnika začnejo izrisovati manjši krogi. Ko so zapolnjeni se smatra kot da je uporabnik končal z interakcijo/urejanjem. Tako se izdatku shrani trenutna nastavljena vrednost.

Vsi dodani izdatki in vrednosti se shranjujejo tako, da če zapreš okno/sejo so podatki varno shranjeni v localStorage - tako da če kdaj kaj pravilno ne izriše je potreben v localStorage pobrisati ključ `slidy` - glej [Atributi - projectName](#atributi)

Slidy za izrisovanje uporablja prilagodljiv razpored elementov (desktop: fixed 980px width, responsive width 960px do 480px, pod 480px imamo fixed width 480px)

Vrednost vsakega izdatkov lahko dobimo na dva načina (ker se med drugim vrednosti hranijo kot hidden input)
```
- z document.getElementById("slidy-i-" + ime izdatka)
- z uporabo funkcija Zelim.izdatek("slidy-i-" + ime.izdatka)
```

*Če obstaja dva ali več izdatkov z istim imenom se na koncu doda 1,2...*

####Primer:
```
Imamo izdatek z imenom Hrana - ustvari se element z id-jem "slidy-i-hrana"
Dodamo še en izdatek z imenom Hrana - ustvari se element z id-jem "slidy-i-hrana1"
naslednji "slidy-i-hrana2" itd...
```


- Za ogled live demo klikni tu [demo]
- Za izvajanje testov klikni tu [tests]

[demo]:http://problematik.github.io/slidy/src
[tests]:http://problematik.github.io/slidy/test

*Za testiranje se uporablja lasten mini testing framework*



####Atributi

Ko ustvarjamo aplikacijo Slidy, ji lahko podamo naslednje vrednosti:

| Ime  | Razlaga | Privzeta vrednost | Tip |
| -------------: | ---------------------- | ------ | ----- |
| `preFix`  | Kaj pripenjamo id-jem elementov v dokumentu  | slidy | `string` |
| `editModeTimeout`  | Po kolikšnem času (v ms) po zadnji interakciji s canvasom prekinemo z urejanjem drsnika in sprejmemo novo vrednost  | 3000 | `integer` |
|    `projectName`| Pod kakšnim ključem shranjujemo podatke v localStorage    | slidy |`string` |
| `mouseAllowed` | Ali dovolimo uporabo miške z interakcijo z drsniki | odvisno od podpore brskalnika | `boolean` |
| `tapCas` | Kolikšen je maksnimalni čas med dvema klikoma, ki se še šteje kot double tap | 200 | `integer` |
| `tapZamik` | Kakšna je lahko razlika/dolžina med dvema klikoma, da se še šteje kot double tap | 30 | `integer` |
| `canvasElement` | Wrapper za canvase | div#slidy-canvas-wrapper  | `DOMElement` |
| `width` | Širina izrisovalnega polja | integer | `canvasElement.width` |
| `height` | Višina izrisivalnega polja | integer | `canvasElement.height` |
| `canvasBackground` | Canvas element v katerega rišemo ozadje drsnikov | canvas#c-background | `DOMElement` |
| `canvasSliderji` | Canvas element v katerega izrisujemo krožnice drsnikov | canvas#c-sliderji | `DOMElement` |
| `zacetek` | Kot na katerem se začnejo izrisovati drsniki | 270  | `od 0 do 360; kjer: 270 zgoraj, 0 desno, 90 dol, 180 levo` |
| `sirina` | Sirina kroznica, ki jo izrisujejo drsniki | 25 | `integer` |
| `krogBarva` | Kaksne barve naj bo krog na drsniku | white | [canvas color values] |
| `krogBarvaObroba` | Kaksne barve naj bo obroba kroga na drsniku | #bbb | [canvas color values] |
| `krogWidth` | Širina obrobe kroga na drsniku | 1 | `integer` |
| `ozadjeKot*` | Kot, ki se uporablja za izrisovanje ozadja | izračunamo kot krožnega loka glede na polmer in OZADJE_DOLZINA OBARVANEGA_DELA | `integer` |
| `ozadjeRazmik**` | Kot, ki ga uporabljamo za izrisovanje presledkov ozadja | izračunamo kot krožnega loka glede na polmer in OZADJE_RAZMIK| `integer` |
| `ozadjeBarva` | Barva ozadja | rgba(128,128,128, 0.3) | [canvas color values] |
| `barvaCountdown` | Barva za odštevalnik | rgba(128,128,128, 0.3) | [canvas color values] |
| `barvaCountdownPassed` | Barva za odštevalnik - pretekel čas | rgba(128,128,128, 0.7) | [canvas color values] |

* **OZADJE_DOLZINA_OBARVANEGA_DELA** `preračunano glede na r=100, α=5°; default vrednost = 8.726646259971647`
* **OZADJE_RAZMIK** `preračunano glede na r=100, α=5°; default vrednost = 10.471975511965978`

[canvas color values]:https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Applying_styles_and_colors

####Known bugs/todos
- JSLint kode
- večji test coverage
- avtomatsko predlaganje polmera ob dodajanju drsnika/izdatka (glede na prejšne, konsistentneši izgled)
- omogočanje uporabe večih seznamov stroškov

######*`Ne deluje na IE starejšem od verzije 9 - ta ne podpira canvas elementa`*

