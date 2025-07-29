# fast-calender-manager
This is a web app based tool for modifying my GCal faster, for blazingly fast week planning xD


## Description
Diese Webapp macht es einfacher Termine zu planen/modifizieren, was wiederum Zeitspart, wenn ich wieder meine Woche planen muss



## Requirements
- Die Ladezeiten sollen so gering wie möglich sein
- Modifications UI ist per Rechtsclick sichtbar
- Modifications UI ist sehr übersichtlich und mit nur wenigen clicks veränderbar
	- Farbe
	- Datum
	- Uhrzeit
	- Titel
	- Beschreibung
	- Löschen
	- Schnelles duplizieren
- Die Beschreibung soll per Rechtsklick sichtbar sein
- Bulk editing
	- Event seletion
		- Alle Events sollen eine Checkbox haben, wodurch man sie für weitere Modifikationen auswählen kann
		- Ein Zeitraum soll auswählbar sein, indem dann alle events ausgewählt werden
	- Alle Modifikationen die für ein einzelnes Event möglich sind, sind auch für ausgewählte Events möglich
- Häufig erstellte Events sollen per Template Event und drag & drop sehr einfach hinzufügbar sein



## Limitations
- Ich brauche nur eine Wochenansicht
- Das Tool ist hauptsächlich nur zum verändern von GCal
- Das Tool ist nicht als Ansicht gedacht
- Es soll ohne Datenbank und online Webseite funktionieren
- Es muss nicht hübsch sein



## Tasks
- [ ] Init project
	- [ ] Get Typescript & React running
	- [ ] Get a FullCalendar instance up and running
	- [ ] Load GCal events into FC
	- [ ] Make events modifieable in FC
- [ ] Implement requirements
	- [ ] Modifications UI ist per Rechtsclick sichtbar
	- [ ] Modifications UI ist sehr übersichtlich und mit nur wenigen clicks veränderbar
		- Farbe
		- Schnelles duplizieren
		- Datum
		- Uhrzeit
		- Titel
		- Beschreibung
		- Löschen
	- [ ] Die Beschreibung soll per Rechtsklick sichtbar sein
	- [ ] Bulk editing
		- [ ] Event seletion
			- [ ] Alle Events sollen eine Checkbox haben, wodurch man sie für weitere Modifikationen auswählen kann
			- [ ] Ein Zeitraum soll auswählbar sein, indem dann alle events ausgewählt werden
		- [ ] Alle Modifikationen die für ein einzelnes Event möglich sind, sind auch für ausgewählte Events möglich
	- [ ] Häufig erstellte Events sollen per Template Event und drag & drop sehr einfach hinzufügbar sein
