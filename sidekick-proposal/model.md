# Sidekick deck: model and assumptions

Every number in the deck's market, business model, go-to-market, financials and ask slides comes from here. Figures marked **sourced** come from outside research. Figures marked **assumed** are our choices and need checking against real events and quotes before a pitch.

## Market

| Input | Value | Status | Source |
|---|---|---|---|
| Business events in Malaysia, 2025 | 393 | sourced | MyCEB, via Meetings & Conventions Asia |
| Attendees per event | about 130 | sourced, one state | Penang 2025: 451,198 delegates over 3,391 events |
| Competitor price, Swapcard | USD 610 for 200 attendees | sourced | G2 comparison (vendor-stated) |
| Exchange rate | RM 4.4 per USD | assumed | check the rate on the day |

The national event count covers business events in general, not networking events, so 393 is an upper bound. The Penang count uses a different definition of "event" and is one state only.

### TAM, SAM, SOM

Built bottom-up from counted events and our price, as Antler's guidance asks: counted customers times average spend, not a share of a headline market.

| Level | Events a year | Value a year | Basis |
|---|---|---|---|
| TAM: all business events in Malaysia | 393 | RM 393,000 | 393 × RM 1,000 |
| SAM: networking-led events | 197 | RM 197,000 | 50% of TAM. **Assumed.** No source gives the networking share. |
| SOM: year-2 plan | 40 | RM 40,000 | The plan in the Financials section |

- **TAM excludes** meetups, community events and internal company events. Those are probably a larger group, but we have no count for them, so they are left out rather than guessed.
- **The SAM share is the weakest number here.** At 50%, the year-2 plan is about 20% of SAM. At 25%, it would be 40%, which an investor would question. If the networking share turns out lower, the plan needs to move with it.
- **SOM uses the year-2 event count** from the volume table, so the market and financial slides agree.

## Price

- RM 1,000 per event, paid by the organiser. **Assumed.**
- Swapcard's anchor is about RM 2,700 for 200 attendees, or about RM 13 per attendee. At 130 attendees, RM 1,000 is about RM 8 per attendee.

## Cost

| Line | Per month | Status | Basis |
|---|---|---|---|
| Engineer, months 1 to 12 | RM 6,000 | assumed | Between the Indeed average (about RM 5,360) and the mid-level range (RM 5,500 to 9,000) |
| Second engineer, from month 13 | RM 6,000 | assumed | Same basis |
| Marketing and operations | RM 3,000 | assumed | Our estimate |
| Cloud (AWS) | RM 300 | assumed | Pilot scale; the stack has a budget alert in `backend/lib/stack.ts` |
| Other (legal, tools, insurance) | RM 1,000 | assumed | Our estimate |
| Model cost per event | RM 30 | assumed | Bedrock Haiku at about USD 1 per million input and USD 5 per million output tokens (third-party listings, not AWS's own price page). About 1,500 calls per event, a few thousand tokens each |

Founders are not paid in this model. The model does not include founder salaries, office space or equipment.

## Volume and revenue

| Measure | Value | Basis |
|---|---|---|
| Paid events, months 1 to 12 | 20 | assumed: about 5% of the 393 events |
| Paid events, months 13 to 24 | 40 | assumed: about 10% of the 393 events |
| Revenue per event | RM 1,000 | assumed |

## Financials (cumulative)

| Month | Events | Revenue | Cost | Net |
|---|---|---|---|---|
| 6 | 6 | RM 6,000 | RM 61,980 | -RM 55,980 |
| 12 | 20 | RM 20,000 | RM 124,200 | -RM 104,200 |
| 18 | 40 | RM 40,000 | RM 222,600 | -RM 182,600 |
| 24 | 60 | RM 60,000 | RM 321,000 | -RM 261,000 |

Cost is fixed monthly cost plus RM 30 per event. The month 12 to 18 jump is the second engineer.

## Ask

- **Raise: RM 220,000.** This is the 18-month net burn of RM 182,600, plus a 20% buffer (RM 219,120, rounded up).
- **Use of funds over 18 months:** team RM 144,000 (65%), marketing and operations RM 54,000 (24%), cloud, tools and other RM 24,600 (11%). Total RM 222,600.
- **Milestone:** 40 paid events in 18 months at RM 1,000 each, with at least one in three organisers booking again. The second number is an assumption to test in the pilots.

## Go-to-market

Conversion rates are assumed, not measured:
- 100 organisers emailed: 10% reply, and 30% of replies book a pilot, which gives about 3 pilots.
- 3 free community events of about 40 attendees each: 1 in 4 organisers asks for a paid event.
- 20 venues offered a place check-in: 1 in 5 agrees to a monthly event.

## What would change these numbers

- A real price: test RM 1,000 with the first three pilots before quoting it to investors.
- Real attendance: if the average event is under 130 people, per-event pricing looks weaker against Swapcard.
- Real model cost: the RM 30 per event assumes the model call counts above. Measure it on the first events.
- Hiring cost: the RM 6,000 salary is a Kuala Lumpur mid-level guess. Change it to the real offer.
