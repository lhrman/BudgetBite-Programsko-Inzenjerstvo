# BudgetBite – Studentska platforma za zdravo i povoljno kuhanje

**BudgetBite** je platforma koja pomaže studentima planirati, kuhati i jesti zdravo unutar studentskog budžeta.  
Cilj aplikacije je omogućiti studentima jednostavno, povoljno i svjesno kuhanje koristeći sastojke dostupne u studentskim uvjetima i s minimalnom kuhinjskom infrastrukturom.

Platforma nudi brze recepte, video tutorijale te personalizirane preporuke recepata prema studentovim životnim navikama.  
Na svakom video receptu jasno su istaknuti **vrijeme pripreme** i **potrebna kuhinjska oprema**, a svi recepti su prilagođeni pripremi u studentskoj sobi ili malom frižideru — bez potrebe za velikom kuhinjom.

---

## Opis projekta

Korisnik unosi:

- tjedni budžet  
- raspoloživu kuhinjsku opremu  
- prehrambene ciljeve  

Sustav zatim omogućuje:

- pretragu financijski prihvatljivih recepata  
- generiranje **jednotjednog plana prehrane**  
- praćenje prehrambenih navika, troškova i raspoloženja  
- vođenje **Food Mood Journala** i tjednih refleksija  

---

## Glavne funkcionalnosti

- **Registracija i prijava** putem OAuth 2.0 (Google, Apple, Microsoft, FER account)
- **Personalizirani onboarding** (upitnik o budžetu, opremi i ciljevima)
- **Biblioteka recepata** s filtriranjem po vrsti jela, trošku, vremenu i opremi
- **Video i audio vodiči** – kratki tutorijali prilagođeni studentskim uvjetima
- **Praćenje budžeta i prehrane** – unos troškova i usporedba domaćih i kupovnih obroka
- **Food Mood Journal** – osjećaji prije i nakon jela radi boljih preporuka
- **Tjedna refleksija** – automatski pregled potrošnje, raspoloženja i napretka
- **Izazovi i gamifikacija** – značke poput *Budget Master*, *Healthy Hero*, *Zero Waste Student*
- **Planovi i kalendar** – sinkronizacija tjednog plana obroka s Google Calendarom
- **Ocjene i zajednica** – korisnici ocjenjuju recepte i dijele iskustva
- **Pametne notifikacije** – personalizirani podsjetnici temeljeni na budžetu, ritmu i raspoloženju

---

## Uloge korisnika

| Uloga | Opis |
|------|------|
| **Student** | Bira recepte prema vremenu, opremi i budžetu; prati troškove i zdravlje; sudjeluje u izazovima. |
| **Kreator** | Objavljuje kratke video recepte, trikove i savjete. |
| **Administrator** | Upravlja sadržajem, korisnicima, popustima i verifikacijom recepata. |

---

## Sigurnost i privatnost
 
- Autentikacija putem **OAuth 2.0** s granularnim korisničkim ulogama i audit logovima  
- Usklađenost s **GDPR** regulativom  
- Šifriranje podataka u prijenosu i mirovanju  
- Mogućnost **brisanja i izvoza korisničkih podataka**    

---

## Tehnologije

- **Frontend:** React  
- **Backend:** Node.js + Express  
- **Baza podataka:** PostgreSQL  
- **Autentikacija:** OAuth 2.0, JWT  
- **Cloud hosting:** Render 

---

## Članovi tima

- **Vida Crnjak** — [GitHub](https://github.com/vidacrnjak)  
- **Josip Ćulum** — [GitHub](https://github.com/jculum7)  
- **Patrik Erceg** — [GitHub](https://github.com/ercegpatrik)  
- **Lorena Hrman** — [GitHub](https://github.com/lhrman)  
- **Dunja Jakovac** — [GitHub](https://github.com/d-jkv)  
- **Vida Šimunović** — [GitHub](https://github.com/vidasimunovic)  
- **Ivor Turkalj** — [GitHub](https://github.com/ivorturkalj)

## Upute za testiranje

- **Link stranice:** https://budgetbite-r5ij.onrender.com/


### Upute za spajanje na bazu podataka  

- **Na računalu je potrebno imati instaliran PostgreSQL (ili barem PostgreSQL command line klijent)**  

- **Spajanje na bazu naredbom (u terminalu):**  
  `psql "postgresql://postgres:LLnaYqHyAsPhRmRHVtZOTvQSDGOFyiJQ@shortline.proxy.rlwy.net:26437/railway"`  

- **Važna napomena:** nakon spajanja na bazu, kako bi ispisi tablica uspješno radili potrebno upisati naredbu `\encoding UTF8`  

- Nakon uspješnog spajanja na bazu, na početku retka u terminalu bi trebalo pisati `railway=#`  

- Tada je moguće pisanje i izvršavanje SQL naredbi poput `SELECT`, `INSERT INTO` itd.  

- **Imena tablica pišu se isključivo malim slovima**

  
 



### Računi za testiranje funkcionalnosti 

- **Student:**  
  email: random@student.com  
  pass: 1234  
  user_id: 29  

- **Creator:**  
  email: random@creator.com  
  pass: kreator  
  user_id: 30  

- **Admin:**  
  email: random@admin.com  
  pass: admin123  
  user_id: 31  



### Upute za upravljanje admin panel-om 

- Admin se prijavljuje na stranicu, stranica ga preusmjerava na admin panel  
- U tekstualno polje piše se user id računa kojem se želi promijeniti uloga  
- Zatim se bira nova uloga koja se želi postaviti  
- Pritiskom na gumb uloga se mijenja  


    
   
   

