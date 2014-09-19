Slidy
==

###Delo z izdatki

Vsak poimenovani izdatek dobi svoj drsnik.
Drsniku lahko nastaviš razpon, polmer, korak ter barvo.

Vsak izdatek lahko prilagodiš tako, da klikneš na drsnik. Ko klikneš na drsnik se izdatek za drsnik postavi v ospredje (ostali se začasno skrijejo), tako da lahko začneš z nastavljanjem vrednosti.

Z miškinim/prstnim potegom lahko nastavljaš vrednost, s klikom na krožnico drsnika pa vrednost premikaš za korak.
Po izteku 2.5s po zadnjem dotiku se ti omogoči možnost shranjevanja vrednosti. S klikom na >>OK?<< se vrneš na izpis stroškov, kjer se spet prikažejo vsi stroški ter njihovi drsniki.

Vsi dodani izdatki se shranjujejo tako, da če zapreš okno/sejo so podatki varno shranjeni v localStorage.

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

####Known bugs/todos
- da se ustavi na 0 oz. na max vrednosti, da ne skoči iz 0 naprimer na 180
- dodajanje animacij
- JSLint kode
- večji test coverage
- avtomatsko predlaganje polmera ob dodajanju drsnika/izdatka (glede na prejšne, konsistentneši izgled)
- omogočanje uporabe večih seznamov stroškov
