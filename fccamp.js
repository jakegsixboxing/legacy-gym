/*__FCCAMP__ ==========================================================
   Fight Club · camp tab for fighters · 29 Sep 2026
   Today / Week / Progress / Board. Black, gold and white, thin gold edge.
   Reads and writes fc_attendance (day slots 0,1,2 primary · 11 Tue S&C ·
   3 Thu S&C · 4 Fri sprints · 5 Sat class · 15 Sat sparring; attended
   true = trained, false = missed), fc_weighins (day 0 / 3), fc_runs (3 km),
   fc_spar_rounds (one row per round). Board and who's-in come from the
   fc_board / fc_who_in functions (aggregates only). Replaces fcweek.js.
   Additive: remove the script tag to get the old Camp / Progress tabs back.
   ==================================================================== */
(function(){
"use strict";
var CAMP="fc2026";
var WHO=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce"];
var SPAR_SAT_WEEKS=[2,4,6,8,10];
var SPRINTS=[
 ["6 × 100 m at 80%","Walk back recovery. Learn the surface, run tall."],
 ["8 × 100 m at 85%","Walk back. Relaxed shoulders, drive the arms."],
 ["6 × 150 m at 85%","90 sec rest. Hold form through the last 50."],
 ["4 × 200 m + 4 × 100 m","Games week. 2 min rest on the 200s, walk back on the 100s."],
 ["8 × 150 m at 90%","90 sec rest. Fight pace efforts, breathe between."],
 ["10 × 100 m at 90%","60 sec rest. Short rest now, this is the round-by-round engine."],
 ["6 × 200 m at 90%","2 min rest. Long efforts, stay on the toes."],
 ["8 × 200 m at 90%","90 sec rest. Hardest sprint week of camp."],
 ["3 × ladder 200 / 150 / 100","Games week. Walk back between reps, 3 min between ladders."],
 ["4 × 100 m sharp","Fight week. 3 min walk between. Feel fast, finish fresh."]];
var MILES=[[10,"Recovery day"],[20,"Recovery weekend"],[30,"Legacy apparel"],[50,"Recovery week"],[80,"Fight singlet"]];
var SESS={0:[{key:0,t:"6:45",ap:"PM",n:"Tech &amp; drill sparring",s:"Fight Club · all levels, split for rounds",tier:"p"}],
 1:[{key:11,t:"6:00",ap:"PM",n:"Strength &amp; Con",s:"Grunt · lift first, box after",tier:"r"},{key:1,t:"6:45",ap:"PM",n:"Skills &amp; drills",s:"Fight Club · no sparring, so the double works",tier:"p"}],
 2:[{key:2,t:"6:45",ap:"PM",n:"Open sparring + bag work",s:"Fight Club · every ring live · headgear, 16oz",tier:"p",rounds:true}],
 3:[{key:3,t:"6:00",ap:"PM",n:"Strength &amp; Con",s:"Grunt · the second lift is where the advantage is",tier:"r"}],
 4:[{key:4,t:"Any",ap:"",n:"Sprints",s:"",tier:"b",sprint:true}],
 5:[{key:5,t:"Any",ap:"",n:"Any class",s:"8am or 9am",tier:"b"}],
 6:[]};
var LOGO="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCACgAKADASIAAhEBAxEB/8QAHAAAAQQDAQAAAAAAAAAAAAAABgAEBQcBAggD/8QAQRAAAgEDAwIEAwYEAwYGAwAAAQIDBAURAAYhEjEHE0FRFCJhCDJxgZGhFSNCwWKx4RYXUnLR8BgkM4KywpKi8f/EABkBAAMBAQEAAAAAAAAAAAAAAAACAwQBBf/EADARAAICAQIEAQwCAwAAAAAAAAABAgMREjEEEyFRQSIyQmFxgZGhscHh8AUzFCNS/9oADAMBAAIRAxEAPwDlTS0tLQAtLS0tAC06t9tqbpO0NMIsqjSM0sqRIigd2dyFHoBk8kgDJIBJdo7FlvNc8VcstOYwGRHjPluerBDt1AqAA/AyepChKE9QKLpvDbO1Ep6O0RSXmooUaOCSqcPHTfNn5cAKp5JPlheonLEnJ1ks4l6tFSy/kWhVlapPCIGyeF1dcEjmnYxoVDuJQ9Moyv3Ot0LdYJ9IyhAOHzxre90W1rDdZilTBN5jMhjoI1eOBTgjCzGU5HPPXn0z3zAX7eF73G5+OrXMRPEEfyRr/wC0f3zqGHyE5VT6e40Rpsk9VkvcjrshHpBe8Oq3f1pjhkjo7M1bI0axiS7FaoRYzygk6iufUAjOB7aiaPdNLbaeKAbYstQIzkSVEfmO34n15z/l6aGy7P3x+mtx90E9xxj6aouHglj7sV3SbyFab7pcFn2ft0nGCVpsYz9Dkae2/fW3o5xNLt2aglZmMk1tqTAzdXSSMR9GFyoIXsOcaBMlu/PGANYHfXHwtbX5YK+aLAp6PaN/rYwtyVJGYlUq4gignv1leh39MEyZzkknkHzuHhPW00NRVLIwiIU04gzVAnIz1soV8dyCkb8jB6R82gQgepH5alLPuq9WEFaCvmjiYYaInqQj8D2/LU5UWx/rn8f37DKyD8+PwI2aknp4opZImWKUZjkxlX7ZwexIyMj0PB146OrDuK23mr8i8wRU9TPiP47K8gleHVwUcDpGAwOMcYIB17718Oltz1FZa1EFDFF1x+ZKCjoo/qcniUgZwQFds9BBZIg3+Uoz0WLH0/fzscdTa1R6or7S161VLPQ1M1LVQS09RA7RyxSqVeNwcFWB5BBBBB15a0pprKIi0tLS10BaWlpaANkR5XWONWd2IVVUZJJ9ANWTtLZdDb7c18vdQ1NFEBLHURThCrq4IMZAJI4PzKQWOOk9IzJGbM25CIai4XaOGKlgHVJI8vJ+U/ysKeAcjqyM5AXj5g0Nubck+4Kxz5sqUYfqjhY8DjAJA46tZLXK2XLg8Jbs0V4rSm9/Akd3b6mv4Wht8QorZCojSJcK0gUYHVj0x2UcaFG6TgAj8tJUDcggY75OsFB1Y9Ppq9dca46YojObm8yN4m6ZVwobJxzznSkUDt79xrAK9HI5B1uz9SdOPrn+2qCnmFJ9se+t3HQAAcgj2xrVTg4HY+h9dYkfMjHGM+me2gDGfbGsd9ZOP6TrLNzyAfQ40AZQKQevPbjHfWOngkc/hpKuRnn89Ig8e/voA1xzoq2zvq4bfC00jGpoSVzFJyUA/wCE+nHp20Lhc9/11tyV4ycDHH99JOuM1pkhozcXlBvuvbUdwhW82pIpaB4QRLAcBGLdugKT0qoPy91HrgKugSWJ4XKOuGH/AGD9R9dEWz92z7ZrvmBloZT/AD4Bz/71B/qA/UcHUvvfbFDHTtfbe838PqsNTkfMiuTkg+qq3JB9GBUjnqXPCbqly57PZ/YtKKsWqO/iAelpaWtZnFqY23Ypb3XRQRkKXfpBK5AUcu3Yg4GBj3YfXUVHE8zhEGWP5fmfYfXRy0ibc2/NX0M8jLUOaak88dMyQfMVOAWCkklyoJGW76hfPC0rdlaopvL2Qy3teYE6LBauqOgo/lfDZ81x7++P886EwVJHVn641ksGJOTknJxrAbB7A+vOqV1qEcIScnJ5Lp8PfAW3bt2vQ3i43yeglq1ZkiRUYH5yFPJzjCnOeeRoxh+ybZ3kHm7kuQX1KwRnHHbv3Ppo72JtdLbtfb8XlATRW+Iux5ywHVzj2J9dVp4i/aB3Ps/elystqgtL0tGUTrmiZmZiiluzD1J9NOKQW8vAO17e3ZtXb1vvFbVz3yeVJBJGimGNOk9QxwTgnvxxoxr/ALKm2aC0Vlxk3LeOmmp5JzmGIAhULH8O2h7wx3xfPFnxhs1fdoqJWtFDUFFp1ZEVSCCTkk5y/fV0eL94ntPhvuKo6ekPQywJ0nsG6Ywcev3u+gDmzwg8D6rxKhkudbXm2WiJzGHWPrlqHGOpUB4AGRkn1OMHVmzfZT2rAyiTc13Bc8Dy4hjgk5447aMfAa2rb/CiwA5PnJJUNgDu8rEH64AGoXcG/LvSeN9j2jQClNBPDHJUiaEM56ld2AY/dXCrx799AAZvH7L9JbLDU19hvtTU1VOhlWmqo0HnKBnpBXsSASCeDjHGhbwZ8HLf4l2u519wra2lFJOkUZp+nDZUsc9QPPb9ddKboq5rTtG91b9PRBb52PSmeRG2M+3OgT7LdN8N4cTzB4w9RXzN2ORhUXn9ONAFUeNfhJZ/DG32ya33G4VM1dNInRUhAFVEXJHSAcktokP2d7DTUMU9bebyXanVxT00EckrSFQfLVByxye/YDuRp19pfN13ts6ydRbrByg95Jwn6/Lq+qeSOnuBURkRKgjOFH3c+p/AaAOUdkeCp3jer3BNV1FtpbRVpTyxOiy1DAk55X5AVxzjI54zo5/8MW3Eq5YW3LcWw5EYjSIswBAP5gnGdV5ZvGvcGzLpfjaI6CaK5XGSskepjZmJ6mAwQwwMH99dPbBqaq87at10uEcEM1bTpWTBEAUyScnAP9OMcd86AKpm+y/tpY+sblvDHsuKaM9Tew51WdLLRbe3JeNjVMxrLUah6aKWb7yyDg4xwOo/ocfXVi+K3jpfNp72ue3LbbbVNSUZjUtOsjMzGNWbPS4Hdj6a5+uNdLc7lVXGbpWWplaZugnCknPGecDSW1qcdLGhNxeUOt10lbT3yrNdJPU1EjmWSplbrafqYnzGPck+pOSWySedQ2rOlNBuXaVNfaqgFdNay0NZTrIYS8ZXBZGH3WGRIpIYdQOVYZU15dLXV2avloK6LyqiIjIDB1YEAqyspKsrKQyspKsCCCQQdSot1LS91+/vtHtgovK2Y4sFDDcq5aOWGaR5sLE0bhRGQwLMwweodAYYGOWBzxgvt6VaPdfgoCBBSDywB26vX9OB+Wn2x4VHxlbUxSLDRQFgQxX5m56uTjJUAcdxjQrNK1RO8r8vIxY/iTnRHyrW+379AfSC9Z5j308tFEbndKKhUHNRPHCMd/mYD++mue4wPx0W+Elv/iniXtum6Q4NfHIV9wh6z/8AHWgkdvqixqsMKK0calML83yg9IH4caoTdP2brluzddzu77qt0Px1U84VqeRujqbhcjvgY5Gr1rLotsp5qtyvlwJJUuijHUqJ1HnsP/7qgIvtbvCY+jZcShAOki4N1DnJ56M9/wC+gDH2Y9vpbfEHdSmeOqW2R/CCZVwsp87HUM9s+XkasH7TdxNF4T1sRJD1tZTwD6gMXP4fd7arv7P27LNtqzbjv18uEFM1bcI1WN265JWAZvlQAs5y/oPXXn4/buvG7rbY7Y+3K+00FXXddPUV+ElqXChP/RySqjrBy3Jz20AXps2mSw+H9kjm6IoaW2wF2lkCIuIgSSTwOSdc77rqt23bxlve6tjW6W8CjkFHDVU8HnxqfICcemcdRGrusOwaCKoglvdTWbirkwqS3KTzIYSMKDHCuI0xg89JP10OeCW4qG63jelLGJJK17zNWSv0fyzGzhIwGzyflJxj89AFHbyp/Fm5UNRcN1QbgNAmWkM4McCDIH3Rhe+PTXSXgXb/AOFeEu3gxCCeJqhiTjPXI5/yxxqG+0RVJS+FFy/lhWqJqeEE8gEv1cfkh50d7Co0t+xrDRFV6ILfT/KffygTz78+nvoABN8+F9y3T4r2XdMVbSiktvw//lCrecehmcnt0jJ7EnRtdZ57ZZbpcJCgNNTTT9bNnJWNjwD65xn8dDtp8VhdfFi57EgsqKKMTeZX+fnq6FBOY+n1Jx3098Xrgbf4b7lmchX+BeJeeQXKp/8AbQBxHy3AyS37k67421Rx2+x0VApTNPTJD155YKig49wOOR241wxtij/iG5bVRhC5nrIY+kDOQXA12puzfm39mxxvcpXnq52L01BSKXqKjnICRjkD6nA0AcieKNzFz8R9y1fV1q9xlUN7qrdI/ZdChzjjtnTm41RuFxqqxhhp5nmK9+SxJH76bliRgngntoALfDW6LT3xrdOSae4xmJl7gsAcfryv56gtyUKWq4vbvISKWkZomZeo+cOosrsSx56WC8BRhV4JJJZU88lHPFPGSJInDqRxgg50W+IqQzVFLdWilJr6VWUgqoVwQQWwCG+Q4wCOcHPGDmcdNyff6r8F09VbT8BpSyR0ey66WJWQ1UvlgdWcLkd/yyNC4OBnHOiGtkaLZtDAVwJJS4Oe/Lft/rodAOdPSt36xLHt7DIBAzq0fs22/wCM8UqOfpDfB0tRU/RfkKg/Tl9VeGAPsPUjVyfZrtUNwv8AeJ5KmvpooqJYm+El8t5Op89JYDqCkJz0kH641YmXH4wbhttr2le6Zq9GuD0ThaSAF5FJHR1uBnoX5u7YHb31xyWHY5411Z42y2rbfg/U0FHBT26W4SxwpEgVXqB5gdiccscKCSc4yOdcplck47Z0AdPfZqs1DSbPa6PbqZq2rnmAqnjBkEYKoFDd8ZDcDH56ZeObx1viZsO0hn/lyefIHJIJaZee45Ij9NO/Cbfey9r7CstJVbjt8FaIyZo5GbqhYyMxGAPY+h9tAfid4i27/fBaNxWetW5UVrhgXzKdsdXLFwpI7/OdAHUM1aOiprGjkUwxNMfQkhS2Bjv6ao/7LNtm+H3LdKuJ0aaogT50ILdId2Az/wAwzo7pfGfw+rKeGoXdFJB1cCOdXWSMfUEd+PrpzN42+H1IYpE3RQzF3EXQvX8ueOo/L2HvroAb9p2Rm2jY7YoIkrbmox7BUOO3/ONXJQU5pYqamRh0LGi8dunheNc+eMO/drbs3jsdaC+U01to6xpqyZerphHmJ8zcZ7Ke2rUk8bvD6JHlj3ZQu6oXGVfLEZOO3qca4BWXgUTe/G3ed6dsACpPUP8AHUAf5DRt9o+tWDwxuSlinxVRTQAc9ussf2TVZ/Zs3jtna0+47juS90lBUVjQrCk/Vlxl2YjAPqRqS+0d4hbY3NtK226wXyluk3xomnEJbMarGQO4HGW0AVH4U26pufiLY6ajqDTT/E+Yk4iEhjKKW6gp4JHTnnj310+Nv2/Z9kv95gp5ZK/4KeWavqpfOqJmWI8+Z3C5/pGFHtrnXwLudpsniDT3G8V8FBTU9NORLO3SC5TpC59z1HXR3iddaN/B7cd0oqiOakqaNlppIvuOkkioCD69zoA4xBwB+Gsd/prJHPfWAMcg50AIAj140dXVZbt4d2aaCOSSanl+GAUdTEnqXpA9c/LoG+ujKlzL4W1pZifKqx0jHb5k/wCus/Eei13Rar0l6iNuLiTZltGPmWU9h2Hzd/xOhwD99FFTDTttiqiopviaekqi0crp0O8ZchWK5IUkYJGTjPc6GlPU2AQM6alpp47i2br2GpAGrw8D9z2nw/2BuXctxkxLNVw0kEKnElSQhJRP/wA8k+nr6apFhg5Jye+kZHZFjZ2KKSQCeATjPH5DViYaT3W6eLm8hUXiqZY1Qt0KeIIV/oTP49/UnOjim2BtxY1D2lDgH5ndy30zz350EeFNOWutZUgdQhhAK5+9k9v21NeKtXJ/D7dSI7Ay1DHIJ+bCgDJ/PXlcTKc71VGWDdSoxq1tZJup8O7BUgwfAJTqRgTwuwbq9MckaANi2Gmr9wVEFdClTBTAqVYHDN1dI7dtWLW7stFhYRzXeBvJjVBHEfMdmHqcceg449dC3hJG0sl2qjyzNGPr/U3+eNSqnbGmcpN+GB5xg7IpIXiDYbLZ9vxS0NBDDPJUiMSKTlhgscfsPy0AWyD4250lMR1edMkeM98sBo/8XZI1htkIjw5eVs59Bgfh30F7Tikm3LbhEE6lmEg6+3y/N/bW3hZPkam+5nvS5uF6i4q3ZO2aOhrKhrNTZjgkkQc8dKkgnn30MeGG07XerBU1dxoIamR6kxxvJn5VVVJ7H6nU/uy4tHta5uzAs8DL1Djk4HH668/DMCm2dTEqo8ySSQ+7Dq4/+OvNU7FQ25POUbNMXYljwIG57etP+8OzWyC2QRUckZmmhQkmQfMcN7dsaK59mbZSN3NmouPuL8wJGPU5+moKnkWr8WJ3VgBS0WMnGOoqPb6uda+J1wK2Bo+oK0tQnYn06icftp5cyc4QUnshVpjGUmvElX8PNvToyfw0RM6gL0MQwPPY574wef003qdwtT+A192nLOslRarzDS9Wc9cLs0i4+gaNtTOyYhDYLd5hYsaWPJJJyTzj99UneLlLLdLp0SMIaqpaR0HZsM3Sfyyf11o4Cc3OcZPKRHioxUYtLBGZODpE+mNbDknjv31qSWOSedeoYhY+ui+hLx+Glxx0mN6pQeOVOUx+uhD6/lo0rHWh8ObdGpQzTVJlK9OcgFm5HY8KOD76z8R6K9aLU4y89iP2+Z7jR1tHJIzvPABGC+eFHSufw6QAPYaGwOkkEHI7/TUvteuWjuMbyVAjRD90r97qIBx9eF78YB/PXdFua23aVQMRy/zUx9e4/I5Guwembj3OS6xTIwc8nnHcDWvHvrPV8mAcZ1rnVyRY3hdTN8DXTxT+XK8qxqvvx3PHp1fvpr4ruBcbfTZJCQNJn3LN3/8A11N+GNIYbEtUIss1QzLkj5h2/EDjTW609PevFOio5o0nhigXzEYEq2I2fBH4ka8lTxxMp9sm/T/pUe+Cs8YXVp+FtN0WCWfpDNLV4A7HAVRkH8zp5vyxWS1bWq6intVFFPlUR0iwyt1L2/LOnfh3SLT7RoXIPVK0kxJHA5P78DRxHEq2jUljrgKaXC3D7AZ4sTlrzSwAgiOn6sD06mP/AE1HeHMAm3NG7YxDFI/J+mP7628Sanz92VKhgRDHHFn8FB/vr18OGRbvUgglmgwMDJ+8M4/b9daEtPC+76kW83+8KvEJjDtabq6QzyxplT975ifz7flqU21TvSbYt0WfLYwK2B/VkZ/voc8S6lmsVBAUZPMm6sN64U/9dGFKPhaWCBkx5caAqPYAfp27a8+eVTFd2zXH+x+wDtrTyvvG+VBJYgeSz9/6gP8A699FNxjtFTLDHcPg2VQWQVJXGTgEjPcfXQ14flKprzXOOpp6njH5n9Oe2mXiFEJb7aKIAEtyR6fPIB/bVZQ13ac4wvsJGWmvV+7hxckuaWmrjtzQQOsZ8tyvCAew/DsfTVEhjknXQ9zqY6K2VtQQP5UMpz2AOD/p21zz6DVv415UifGLqhAjnkjjWM86wRrK4wffXpmI2RDKyxouXY4AHqTwNEu6oGpIqa3yVaQtR0ofy2DAyOWCFVwDg4y3zEDCnnJALHaVuNfeYmPEcAMzn2x2/fH6HWu4rnLV1MzRXM1FPVsJnhQuArIzonWpABYKSwILALLjOSwEJ5lYkvAoukM9yIhlMMiyBUbH9LrkH8RosudMb5t+OsSSOaopBhyjZBGOe+DnGDjHGhDRHtG7xUErQSAgyN/SgPmAjBBOc8YBAAOcsMEkY7dHprW6GqefJezB4j27aRIOpjctoFtrPMhU/CzfNH/h/wAP/fppjTWq4Vkfm0tDVTxg4644mYZ/EDTxmnHUTcWngsDYF8ga2R25p4qcQ5aUtIqMeSR05PPB59fbRjRT2SKojr5Km3mqlQ/P5kfmEZ+71ZzgLgZP4ap6xbVrLzuCis04egepJPXPE3yoAWZgvc8KcD1PGpay7Dpb5uS42qlvaVFJRUjVq1lLSPM0yAIcLGDnq+fBGeCp9s6x2cCrG5KWMmiHEuKSa2JfxJ3dR11CLRRzCc+d1yleVTpyAARwck5/LRVty50FNYLbRzXCkURUi5Tz1GCR689+Tx+ugDZ/htU7yttyuFJXxxRW+dInDREkq0crh8Z7fywCP8Y9tRtFtmjqtm1+4Hupino6mKm+D+GLdZkDFT5mcAYR/TjA99dlwMXWq09ji4lqTk0WrcG2vM2ZntLGVwGcmMs3GOD6dvXQJtO72uh3RdRPJFAk5aOB1AWPAbt6gZGP30yvewJLNs22bl/iCzLW+X1QGBk8vzBIV6XPD48purH3cr768b3sWosn+zhkrI5BfaaOoHShHw5ZsdDe5AKtx/xDXa+CUYuLk3kJcTlp42LOq6qx3CRRLNbJxC3BldD0n1K5/tqO3Rum3WuglaKshmnkTESROGLEggE4PA9edVRfbW1jvdwtTyrM1FUy0xkAwHKMVyB6ZxqWj2lCNm/7Q1F3poJpZZEpqJ0PVUCNo1fDdgw81SF9QGOeOZx/j4prMugz4ttdEFnhxU0dFt4+bV0sMslSzfzZVXAwB2Jz6anql7FUVscktRbZZYgBHI0kZY4Oe+eMHVd3jYr2naNFuA18cjVHktJTCIgxLKJDGQ3ZsiF8jjHHfSvmwqix1O3YJa+lP8cpoagOwKrTM7YKOf8ACCCT7HTz4LVNz1bnI8TiKjgJ94bxpUtFZRQzwzyVS+WixtkIp4J4/D888arAc86MZPD+mj8QoNnte+kzSrTmpaidWimJwEeMnI+bHIJGCDodntLvcaqltYqLjHC5VZUp2BZQcBivJXPsdXppjTHCJWWOx5ZH99bEFT+/+unFRbK6iQSVNFUwIT0hpImUZ9skak9tWX4+Z6ycD4Sm5YkfKzYyB+Hqf9dUlNKOoRRbeCXpaJLLt6KGWqgo6u5uA0k2emGP1LYBbCjnCgnJwATxoNml86Qv0IgPZUGAB6D/AFPJ9cnUjuG6vd6wTtNI4GVRGH3E9Ofc8n9OfaK1OmDXlS3Y1kvRWwtLS0tXJhRSXeK7UPwNe0kr9Cov8tUSIg9Ix0/Tp9Bz3JyBqLmluljY08VZUwxEkr5UrKre54OM++o6OR4nDocMP+8fUanqK6RXOJqGtiBQjKP3MQAH547889uc4J1ncdHVLoVUtW+542PdNdZ7/R3mRmrpaYkdNRIx6kIIK5zkZDHkdu+pO2b9jte47jdYbJSx0tdStRGigmkiWOMhAOl1PV1YQZPqSSe+oG5WmW3sHVhNTsOpJV5BHpn202SplTHSyrg54Ud9Wi015JNpp9Qq2d4i1+z6esprfRRSx1kjl1dmOVaCWLo474EvV75Uai6KtuK7drLJDbpZY6ypgqjIqMWBjWQADHGD5h/TXjb7tLAwaS6VkKq3WBAOScY4ORg6IafetBEweeW/1hC4IlrOkfhhT21Oc5rzY5HjGL3Zrdr7uC+bXoNvTWKcQ0Cx+TII5OpOkSBjg8Dq6xn/AJBr23Juu/7la1Gbb3k/wmTzKcQwMMR9MahG4+YZiz1Hnk+w05qPEugSFFo7bUdaj70kxPOOO+c61h8WKimgxHbozJk5dnOG/L01Hm3+EPmU5dX/AED+6pKvcl+q7rBt6egaqczSwxiSQeYzEs2W5GSTxp6l6uUOzn27PtsSlZHaGslhk8yBXaNnCjGMkxL83cAsPXTqp8U66cELRRqDg58w5yP7ew9NMn8StwM2VmiXHYeWDp1O9+iviK41Lx+Rvet13O5bTorBLZ/IWnEQepCydUyxCQRgg8DAlfJHfj20t0eIVbuea1vW2uhVLZKzQw+WehoiI8ROOOofy+55PUcntpm+/r48pkeaFmJzzEONYm3vdqmBoZRSur5BzFzg+n4adSs8Uvj+BWoeD+Q7rvECWq3hatxw2yng/hXw6wU3mO4KxHKhnY9Te2fQAD00PR3Crp55Jqaomp3lJJMMhXIJzjjuNazVslRzIEyOMgYI5zp3aLJUXWRX5hpgcNMw4A9ce508pJLMhUm3iJ6USXPcMwp5quqlgRg0jSysyp9eTjPtqQv17go1jtlrUJS0+CcoGWdg39WeCM5z3BIx2143K5x0NA9DbJYkhLdDEHLy+5DAYI4HJx34HBwPSyNNK8jBQzsWIVQoyfYDgD6DjUow1vLXTsUctKwtzUksSSSSeST66xpaWtBEWlpaWgBayrFGDKSrA5BHcHWNLQBN2u/tAI4ap3eBVZWDfPlcAADPYgAgDOOwwOW05qLHRV7ZoJfh5ivX5EucEYHIPt9Rkex0N69Ip5ITmNivOfwPofxHvqLrecxeCkZraR61FFU0RHnwsgPYkcH89eGedT9FugLClNU0qOgLlpGZizlunAJOQFXBP3SxywJOV6fZksd1UNBQ1FOegFjEesg8Z+QEnGeASBn88a5zXHz0d0J+awbJ0h7alJrXQ94LnFgjIEmB/fWpsFR95J6d1xnIbuNU5kRNDI7AP00gDxj11LLtyp5DzU6YHVkk/nranstI06JLeKQFufkcAA/UkgDXObHud0SIY4yRjXtR0NRXSeXTxNIfcdh+epepprZZ56iKSE1MsJK586N42IYrlGVsSDj7y9QPcHGm9Re3TMVMyImCMwgrgEdgSO2T/wAIPHB9dc5jfSKDSlux1BaKG1ylrnMJpUHV8PF83YZwR6jH5e+vW87jjamjp6VKfOcsqKSqAZGDngknBIGVwo5YMQB2ad5pJXJI8x+tl6iRnn3JJ7nk5OvLS8nU05s7zMdImzu0js7sWZjksTkk+51rpaWrkxaWlpaAP//Z";
var DAYN=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
var ST={view:"today",board:"pts",open:null,who:{},whoAt:0,boardRows:null,boardAt:0,preview:false,pf:null,wk:null,tools:false};
ST.tools=false;try{localStorage.removeItem("fccTools");}catch(e){}
try{ST.preview=localStorage.getItem("fcwPreview")==="1";}catch(e){}
try{var v0=localStorage.getItem("fccView");if(v0)ST.view=v0;}catch(e){}

function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function T(m){try{toast(m);}catch(e){}}
function me(){try{if(pv()&&ST.pf)return ST.pf.user_id||null;return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
function staff(){try{return WHO.indexOf(me())>=0||!!(profile&&(profile.is_staff||profile.is_coach));}catch(e){return false;}}
function pd(s){var p=String(s).slice(0,10).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function fc(){return window.FC||null;}
function camp(){var f=fc();return (f&&f.camp)||{};}
function campStart(){return pd(camp().start_date||"2026-10-12");}
function fightDate(){return pd(camp().fight_date||"2026-12-19");}
function sparOpenWeek(){return Number(camp().spar_open_week||6);}
function weekOf(d){var n=Math.floor((d-campStart())/864e5);return n<0?0:Math.min(10,Math.floor(n/7)+1);}
function CW(){return weekOf(new Date());}
function dayDate(w,i){var x=new Date(campStart());x.setDate(x.getDate()+(w-1)*7+i);return x;}
function fd(d){return d.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];}
function mmss(sec){return Math.floor(sec/60)+":"+String(Math.round(sec%60)).padStart(2,"0");}
function parseTime(s){s=String(s||"").trim();var m;if((m=/^(\d{1,2}):(\d{2})$/.exec(s)))return +m[1]*60+ +m[2];if((m=/^(\d{1,2})[.,](\d{1,2})$/.exec(s)))return +m[1]*60+Math.round(+("0."+m[2])*60);if(/^\d{1,2}$/.test(s))return +s*60;return null;}
function todayIdx(w){var t=new Date();t.setHours(0,0,0,0);var n=Math.round((t-dayDate(w,0))/864e5);return n<0?-1:n>6?7:n;}
function TW(){return Math.max(1,Math.min(10,CW()));}
function TD(){var w=CW();if(w<1)return -1;return Math.max(0,Math.min(6,todayIdx(TW())));}
function phase(w){return w<=0?"Pre-camp":w<=3?"Build":w===4?"Legacy Games":w<=8?"Build 2":w===9?"Legacy Games":"Fight week";}
function dayOf(i){return i>=10?i-10:i;}
function isPast(w,i){var tw=TW(),td=TD();return w<tw||(w===tw&&i<td);}
function isToday(w,i){return w===TW()&&i===TD();}
function pv(){return ST.preview&&staff();}
function pvList(){var f=fc();return ((f&&f.F)||[]).filter(function(x){return x.status==="active";});}
function pvPick(){var L=pvList();if(!L.length)return null;var c={};((fc()&&fc().att)||[]).forEach(function(a){c[a.fighter_id]=(c[a.fighter_id]||0)+1;});return L.slice().sort(function(a,b){return (c[b.id]||0)-(c[a.id]||0);})[0];}
function myRow(){try{if(!staff())return null;var u=me();return ((fc()&&fc().F)||[]).find(function(x){return x.user_id===u&&x.status==="active";})||null;}catch(e){return null;}}
function fighter(){if(pv()){if(!ST.pf)ST.pf=pvPick();return ST.pf;}if(staff()&&!ST.tools){var r=myRow();if(r)return r;}var f=fc();return f&&f.me?f.me:null;}
function cm(){return staff()&&!ST.preview&&!ST.tools&&!myRow();}
function sf(){return staff()&&!ST.preview&&!ST.tools&&!!myRow();}

/* ---------- data views ---------- */
function attRow(w,d){var f=fighter();if(!f)return null;return (fc().att||[]).find(function(r){return r.fighter_id===f.id&&r.week===w&&r.day===d;})||null;}
function attVal(w,d){var r=attRow(w,d);if(!r)return null;return r.attended===false?-1:(r.attended?1:null);}
function primDone(w){return [0,1,2].filter(function(i){return attVal(w,i)===1;}).length;}
function sncDone(w){return [11,3].filter(function(i){return attVal(w,i)===1;}).length;}
function extraDone(w){return [4,5,15].filter(function(i){return attVal(w,i)===1;}).length;}
function bonus(w){return sncDone(w)+extraDone(w);}
function sprintsDone(){var n=0;for(var w=1;w<=10;w++)if(attVal(w,4)===1)n++;return n;}
function wt(w,day){var f=fighter();if(!f)return null;var r=(fc().wi||[]).find(function(x){return x.fighter_id===f.id&&x.week===w&&(x.day||0)===day&&x.weight_kg!=null;});return r?Number(r.weight_kg):null;}
function wiAll(){var f=fighter();if(!f)return [];return (fc().wi||[]).filter(function(x){return x.fighter_id===f.id&&x.weight_kg!=null;}).map(function(x){return {w:x.week,d:x.day||0,v:Number(x.weight_kg)};}).sort(function(a,b){return (a.w*7+a.d)-(b.w*7+b.d);});}
function lastWt(){var r=wiAll();return r.length?r[r.length-1].v:null;}
function firstWt(){var r=wiAll();return r.length?r[0].v:null;}
function run3k(dateIso){var f=fighter();if(!f)return null;var rs=(fc().runs||[]).filter(function(r){return r.fighter_id===f.id&&r.run_date===dateIso&&Math.abs(Number(r.km)-3)<0.01&&r.time_text;});return rs.length?rs[rs.length-1]:null;}
function runsAll(){var f=fighter();if(!f)return [];return (fc().runs||[]).filter(function(r){return r.fighter_id===f.id&&Math.abs(Number(r.km)-3)<0.01&&r.time_text&&parseTime(r.time_text);}).map(function(r){return {d:r.run_date,s:parseTime(r.time_text)};}).sort(function(a,b){return a.d<b.d?-1:1;});}
function bestRun(){var a=runsAll();return a.length?Math.min.apply(null,a.map(function(r){return r.s;})):null;}
function firstRun(){var a=runsAll();return a.length?a[0].s:null;}
function runsUpTo(w){return runsAll().filter(function(r){return weekOf(pd(r.d))<=w;}).length;}
function roundsTotal(uptoW){var f=fighter();if(!f)return 0;return (fc().rounds||[]).filter(function(r){return r.fighter_id===f.id&&(!uptoW||weekOf(pd(r.night_date))<=uptoW);}).length;}
function roundsOn(dateIso){var f=fighter();if(!f)return 0;return (fc().rounds||[]).filter(function(r){return r.fighter_id===f.id&&r.night_date===dateIso;}).length;}
function myPts(w){var p=0,b=0;for(var x=1;x<=w;x++){p+=primDone(x);b+=bonus(x);}var r=runsUpTo(w);return {p:p,b:b,r:r,total:p+b+r};}
function primaryOrder(){var o=[];for(var w=1;w<=10;w++)[0,1,2].forEach(function(i){o.push({w:w,i:i});});return o;}
function streak(){var o=primaryOrder().filter(function(x){return isPast(x.w,x.i)||(isToday(x.w,x.i)&&attVal(x.w,x.i)!=null);});var n=0;for(var j=o.length-1;j>=0;j--){if(attVal(o[j].w,o[j].i)===1)n++;else break;}return n;}
function bestStreak(){var b=0,n=0;primaryOrder().forEach(function(x){if(attVal(x.w,x.i)===1){n++;if(n>b)b=n;}else if(isPast(x.w,x.i))n=0;});return b;}
function weekScore(w){var runs=[0,2].filter(function(i){return !!run3k(iso(dayDate(w,i)));}).length,wi=[0,3].filter(function(i){return wt(w,i)!=null;}).length;return Math.min(100,primDone(w)*20+bonus(w)*7+runs*8+wi*2);}
function projectWt(){var r=wiAll().map(function(p){return {x:(p.w-1)*7+p.d,v:p.v};});if(r.length<2)return null;var n=r.length,sx=0,sy=0,sxx=0,sxy=0;r.forEach(function(p){sx+=p.x;sy+=p.v;sxx+=p.x*p.x;sxy+=p.x*p.v;});var den=n*sxx-sx*sx;if(!den)return null;var m=(n*sxy-sx*sy)/den,c=(sy-m*sx)/n;var fx=Math.round((fightDate()-campStart())/864e5);return {m:m,fight:m*fx+c};}
function target(){var f=fighter();return f&&f.fight_weight_kg?Number(f.fight_weight_kg):null;}
function badges(){var b=[],rounds=roundsTotal(),bs=bestStreak(),full=0,dbl=0,road=0,wi=0,wiMax=0;
  for(var w=1;w<=10;w++){if(primDone(w)===3)full++;if(primDone(w)===3&&sncDone(w)===2)dbl++;if(run3k(iso(dayDate(w,0)))&&run3k(iso(dayDate(w,2))))road++;[0,3].forEach(function(i){if(wt(w,i)!=null){wi++;if(wi>wiMax)wiMax=wi;}else wi=0;});}
  b.push({n:"Full week",d:"All three primary nights in one week",on:full>=1});
  b.push({n:"Double up",d:"Three primary nights plus both Strength &amp; Con",on:dbl>=1});
  b.push({n:"Roadwork",d:"Both 3 km runs in one week",on:road>=1});
  b.push({n:"Six straight",d:"Six primary nights in a row",on:bs>=6});
  b.push({n:"Twelve straight",d:"Twelve primary nights in a row",on:bs>=12});
  b.push({n:"20 rounds",d:"Twenty sparring rounds banked",on:rounds>=20});
  b.push({n:"50 rounds",d:"Fifty sparring rounds banked",on:rounds>=50});
  b.push({n:"On the scales",d:"Four weigh-ins in a row",on:wiMax>=4});
  b.push({n:"Four full weeks",d:"Four full primary weeks",on:full>=4});
  return b;}
function latestNote(){var n=(fc()&&fc().notes)||[];if(!n.length)return null;var s=n.slice().sort(function(a,b){return a.created_at<b.created_at?1:-1;});return s[0];}
function initials(f,l){return ((f||"")[0]||"")+((l||"")[0]||"");}
/* ---------- css ---------- */
var G="linear-gradient(180deg,#ffe58a,#f4c95d 45%,#b8860b 55%,#ffd76a)";
var css=document.createElement("style");css.id="fccCss";css.textContent=
 ".fcc{--gold:#f4c95d;--gold2:#c9a44c;--line:rgba(201,164,76,.45);--mute:#a89f88;--txt:#cfc6b0;color:#fff;font-family:Montserrat,sans-serif}"+
 ".fcc .k{font-size:7.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--gold2)}"+
 ".fccPF{position:fixed;inset:0;pointer-events:none;z-index:25;border:2.5px solid #d4a94a;box-shadow:0 0 8px rgba(244,201,93,.45),inset 0 0 8px rgba(244,201,93,.25)}"+
 "#main .fcx:has(#fcc){background:#050505;margin:-20px -18px;padding:14px 16px 20px}"+
 ".fccHd,.fccDy,.fccTile,.fccCard,.fccTn{border:1px solid var(--line);border-radius:12px;background:#070604}"+
 ".fccHd{padding:12px 14px 12px;margin-top:2px}"+
 ".fccHd .row{display:flex;justify-content:space-between;align-items:center;gap:10px}.fccHd .row>div:first-child{display:flex;align-items:center;min-width:0;flex:1}.fccHd .row>div:first-child>div{min-width:0}"+
 ".fccHd .lg{width:42px;height:42px;border-radius:50%;flex:none;margin-right:9px;background:#000 center/cover;box-shadow:0 0 10px rgba(244,201,93,.55)}"+
 ".fccHd .k{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"+
 ".fccHd h2{font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:25px;line-height:.95;text-transform:uppercase;margin:3px 0 0;color:#fff;letter-spacing:.5px;white-space:nowrap;text-shadow:0 2px 0 #000}.fccHd h2 span{color:var(--gold)}"+
 ".fccHd .cd{text-align:right;flex:none}.fccHd .cd b{display:block;font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:30px;line-height:1;color:#fff;text-shadow:0 1px 0 #000,0 0 8px rgba(244,201,93,.35)}.fccHd .cd small{display:block;font-size:6.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--gold2);margin-top:2px}"+
 ".fccWk{display:flex;gap:3px;margin-top:11px}.fccWk div{flex:1;height:5px;border-radius:2px;background:rgba(255,255,255,.08)}.fccWk div.done{background:var(--gold2)}.fccWk div.now{background:#fff;box-shadow:0 0 8px rgba(255,255,255,.6)}"+
 ".fccCnt{display:flex;gap:4px;margin-top:11px}.fccCnt div{flex:1;min-width:0;display:flex;align-items:center;gap:5px;background:rgba(0,0,0,.55);border:1px solid var(--line);border-radius:10px;padding:7px 6px}"+
 ".fccCnt b{font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:19px;line-height:1;color:#fff}.fccCnt b small{font-size:8px;color:var(--mute);margin-left:1px}"+
 ".fccCnt span{font-size:6px;font-weight:800;letter-spacing:.9px;text-transform:uppercase;line-height:1.3;color:var(--gold2)}.fccCnt .pts{border-color:var(--gold)}.fccCnt .pts b,.fccCnt .pts span{color:var(--gold)}"+
 ".fccVw{display:flex;gap:4px;margin:12px 0;background:rgba(0,0,0,.6);border:1px solid var(--line);border-radius:12px;padding:4px}"+
 ".fccVw button{flex:1;font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:13px;letter-spacing:1.6px;text-transform:uppercase;padding:9px 2px;border-radius:9px;border:0;background:transparent;color:var(--gold2);cursor:pointer}"+
 ".fccVw button.on{background:"+G+";color:#1a1200}.fccVw button.coach{flex:.8;border:1px solid rgba(201,164,76,.5);font-size:11px}.fccVw button{white-space:nowrap;font-size:11.5px;letter-spacing:1.1px;padding:9px 1px}.fccVw.sub{margin:10px 0 6px}.fccVw.sub button{font-size:12px;padding:8px}"+
 ".fccTn{padding:11px 13px 12px;margin-bottom:10px;border-width:1.5px;border-color:#d4a94a;box-shadow:0 0 8px rgba(244,201,93,.28)}.fccTn.ok{border-color:#39FF88;box-shadow:0 0 10px rgba(57,255,136,.35)}.fccTn.no{border-color:#e4002b;box-shadow:0 0 10px rgba(228,0,43,.3)}"+
 ".fccTn .k{margin-bottom:8px}.fccTn h3{font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:24px;line-height:1;text-transform:uppercase;color:#fff;margin:2px 0 6px}.fccTn p{font-size:9.5px;line-height:1.5;color:var(--txt);margin:0}.fccTn p b{color:#fff}"+
 ".fccTr{display:flex;align-items:center;gap:10px}.fccTr .tt{font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:34px;line-height:1;color:#fff;flex:none;text-shadow:0 1px 0 #000,0 0 8px rgba(244,201,93,.35)}.fccTr .tt small{font:700 11px Oswald,sans-serif;letter-spacing:1px;color:var(--gold2);margin-left:2px}"+
 ".fccTr .n{flex:1;min-width:0}.fccTr .n b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:15px;line-height:1.05;text-transform:uppercase;letter-spacing:.5px;color:#fff;margin-top:3px}.fccTr .n span{display:block;font-size:9px;line-height:1.35;font-weight:500;color:#aab6cc;margin-top:3px}.fccTr .n span.fccTier{display:inline-block;margin:0 0 3px}"+
 ".fccTb{margin-top:10px}.fccTb .fccPick{flex-direction:row;gap:6px}.fccTb .fccB{flex:1;padding:12px 10px;font-size:9px;text-align:center}.fccTb .fccB.go{flex:1.4}"+
 ".fccWall{margin-top:10px;padding-top:9px;border-top:1px solid rgba(201,164,76,.2)}.fccWall .wk2{font-size:8.5px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--gold2);margin-bottom:6px}"+
 ".fccAvs{display:flex;flex-wrap:wrap;gap:4px}.fccAvs i{font-style:normal;font-size:8px;font-weight:700;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(201,164,76,.6);background:#161010}.fccAvs i.me{background:"+G+";color:#1a1200;border-color:var(--gold)}.fccAvs i.more{border-color:#555;color:#aaa}"+
 ".fccStrip{display:flex;gap:6px;margin:12px 0 10px}.fccStrip div{flex:1;background:rgba(0,0,0,.55);border:1px solid var(--line);border-radius:10px;padding:8px 6px;text-align:center}.fccStrip b{display:block;font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:22px;line-height:1;color:#fff}.fccStrip span{display:block;font-size:6px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--gold2);margin-top:4px}"+
 ".fccCoach{border:1px dashed rgba(244,201,93,.6);border-radius:12px;padding:11px 13px;margin-bottom:10px}.fccCoach .k{color:var(--gold);margin-bottom:6px}.fccCoach p{font-size:10px;line-height:1.55;color:#e8dcc0;margin:0;white-space:pre-line}"+
 ".fccDy{position:relative;margin-bottom:14px;border-width:1.5px;border-color:#d4a94a;box-shadow:0 0 8px rgba(244,201,93,.28)}.fccDy.today{border-color:#ffe58a;box-shadow:0 0 12px rgba(244,201,93,.5)}.fccDy.b{opacity:.9}"+
 ".fccDy .in{padding:11px 13px 12px}.fccDy .lab{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(201,164,76,.35)}"+
 ".fccDy .lab b{font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:16px;letter-spacing:2.5px;text-transform:uppercase;color:#fff}.fccDy .lab b small{font-size:10px;letter-spacing:1px;color:var(--gold2);margin-left:6px;font-family:Oswald,sans-serif;font-weight:500}"+
 ".fccSt{font-size:7.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:5px 9px;border-radius:999px;border:1px solid rgba(201,164,76,.5);color:#e8dcc0;background:transparent}"+
 ".fccSt.today{background:#fff;color:#05070d;border-color:#fff}.fccSt.done{background:linear-gradient(180deg,#5cff9e,#1fd36a 55%,#0f8a45);color:#04170c;border:0}.fccSt.miss{background:linear-gradient(180deg,#ff6b7f,#e4002b 55%,#8a0018);color:#fff;border:0}.fccSt.log{border:1px solid var(--gold);color:var(--gold)}"+
 ".fccS{display:flex;align-items:center;gap:10px}.fccS+.fccS{border-top:1px solid rgba(255,255,255,.08);margin-top:8px;padding-top:8px}"+
 ".fccS .t{flex:none;width:66px;font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:27px;line-height:1;color:#fff;text-shadow:0 1px 0 #000,0 0 6px rgba(255,255,255,.25)}.fccS .t small{font:700 11px Oswald,sans-serif;letter-spacing:1px;margin-left:2px;color:var(--mute)}"+
 ".fccS .n{flex:1;min-width:0}.fccS .n b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:14px;line-height:1.05;text-transform:uppercase;letter-spacing:.6px;color:#fff}.fccS .n span{display:block;font-size:9px;line-height:1.35;font-weight:500;color:#aab6cc;margin-top:3px}.fccS .n span.fccTier{display:inline-block;margin:0 0 4px}"+
 ".fccTier{display:inline-block;font-size:7.5px;font-weight:800;letter-spacing:1px;padding:4px 10px;border-radius:999px;line-height:1.2;border:0}.fccTier.p{background:"+G+";color:#1a1200}.fccTier.r{background:linear-gradient(180deg,#ffffff,#cfd6e0 45%,#8a94a3 55%,#e6ebf2);color:#0b1220}.fccTier.b{background:#1c1a14;color:var(--gold2)}"+
 ".fccS .n span.fccTier,.fccTr .n span.fccTier{font-size:7.5px;font-weight:800;letter-spacing:1px;line-height:1.2;margin:0 0 4px}.fccS .n span.fccTier.p,.fccTr .n span.fccTier.p{color:#1a1200}.fccS .n span.fccTier.r,.fccTr .n span.fccTier.r{color:#0b1220}.fccS .n span.fccTier.b,.fccTr .n span.fccTier.b{color:#c9a44c}"+
 ".fccPick{display:flex;flex-direction:column;gap:5px;flex:none}"+
 ".fccB{flex:none;font-size:8px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;padding:10px 12px;border-radius:999px;border:1.5px solid rgba(244,201,93,.85);cursor:pointer;white-space:nowrap;color:#fff;font-family:inherit;background:transparent}"+
 ".fccB.go{background:"+G+";color:#1a1200;border:0;animation:fccNudge 1.6s ease-in-out infinite}@keyframes fccNudge{0%,100%{box-shadow:0 0 0 rgba(244,201,93,0)}50%{box-shadow:0 0 14px rgba(244,201,93,.85)}}"+
 ".fccB.ok{background:linear-gradient(180deg,#5cff9e,#1fd36a 55%,#0f8a45);color:#04170c;border:0;box-shadow:0 0 10px rgba(57,255,136,.45)}.fccB.no{background:linear-gradient(180deg,#ff6b7f,#e4002b 55%,#8a0018);color:#fff;border:0;box-shadow:0 0 10px rgba(228,0,43,.45)}"+
 ".fccB.gh{border-color:rgba(255,255,255,.35);color:var(--txt)}.fccB.off{border:1.5px solid rgba(255,255,255,.18);color:#8b8677}.fccB.p{background:"+G+";color:#1a1200;border:0}"+
 ".fccEx{display:flex;gap:6px;margin-top:10px}.fccEx button{flex:1;display:flex;align-items:center;justify-content:space-between;gap:6px;background:rgba(0,0,0,.55);border:1px solid rgba(201,164,76,.3);border-radius:9px;padding:8px 9px;color:#fff;cursor:pointer;font-family:inherit;text-align:left}"+
 ".fccEx button i{font-style:normal;font-size:6.5px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:var(--mute)}.fccEx button i b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:11px;letter-spacing:.4px;color:#fff;margin-top:2px;text-transform:none}"+
 ".fccEx button em{font-style:normal;font-size:7px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--gold);white-space:nowrap}.fccEx button.on{border-color:rgba(244,201,93,.8)}"+
 ".fccFrm{display:flex;gap:6px;align-items:center;margin-top:8px}.fccFrm input{flex:1;min-width:0;background:#000;border:1.5px solid var(--gold);border-radius:9px;padding:9px 10px;color:#fff;font-family:Oswald,sans-serif;font-weight:700;font-size:15px;outline:none}.fccFrm span{font-size:8px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--gold2);flex:none}"+
 ".fccNote{margin-top:8px;font-size:9px;line-height:1.4;font-weight:500;color:var(--txt);padding:8px 10px;border:1px dashed rgba(201,164,76,.35);border-radius:9px}.fccNote b{color:#fff}"+
 ".fccTwo{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}.fccTwo .fccDy{margin-bottom:0}.fccTwo .fccS{flex-direction:column;align-items:flex-start;gap:6px}.fccTwo .fccS .t{width:auto;font-size:22px}.fccTwo .fccPick{width:100%}.fccTwo .fccB{width:100%}"+
 ".fccSec{display:flex;justify-content:space-between;align-items:baseline;margin:14px 0 8px;gap:8px}.fccSec b{font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:17px;letter-spacing:2px;text-transform:uppercase;color:#fff}.fccSec span{font-size:9px;font-weight:600;color:var(--mute);text-align:right}.fccSec span b{font-size:inherit;letter-spacing:0;color:#fff;font-family:inherit}"+
 ".fccSec span .lg,.fccKey .lg{display:inline-block;width:9px;height:9px;border-radius:2px;margin:0 4px 0 8px;vertical-align:-1px}.lg.g{background:#39FF88}.lg.b{background:#4db2ff}.lg.w{background:#fff}"+
 ".fccTiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}.fccTiles.three{grid-template-columns:1fr 1fr 1fr}"+
 ".fccTile{position:relative;padding:11px 12px;overflow:hidden}.fccTile.p,.fccTile.r{padding-right:66px;min-height:92px}.fccTiles.three .fccTile{padding:10px 9px}"+
 ".fccTile .k{line-height:1.3}.fccTiles.three .fccTile .k{min-height:20px}.fccTile .v{font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:26px;line-height:1;color:#fff;margin-top:6px;text-shadow:0 1px 0 #000,0 0 6px rgba(255,255,255,.25)}.fccTiles.three .fccTile .v{font-size:22px}.fccTile .v small{font-size:10px;color:var(--mute);margin-left:3px}"+
 ".fccTile .s{font-size:8px;font-weight:600;color:var(--txt);margin-top:6px;line-height:1.35}.fccTile .s b{color:var(--gold)}"+
 ".fccRing{position:absolute;right:12px;top:14px;width:46px;height:46px}"+
 ".fccCard{padding:12px 13px;margin-bottom:8px}.fccCard .row{display:flex;justify-content:space-between;align-items:center;gap:8px}.fccCard h3{font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:18px;line-height:1;text-transform:uppercase;letter-spacing:.5px;margin:0;color:#fff}"+
 ".fccTg{font-size:7.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:5px 9px;border-radius:999px;border:1px solid rgba(201,164,76,.55);color:var(--gold);white-space:nowrap;background:transparent}"+
 "svg.fccCh{width:100%;height:auto;display:block;margin-top:8px}.fccCard p{font-size:9px;line-height:1.45;color:var(--txt);margin:8px 0 0}.fccCard p b{color:#fff}"+
 ".fccBadges{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px}.fccBg{border:1px solid rgba(201,164,76,.3);border-radius:10px;padding:9px 8px;background:#070604;opacity:.55}.fccBg.on{opacity:1;border-color:var(--gold);box-shadow:0 0 8px rgba(244,201,93,.35);background:linear-gradient(180deg,#1c1a10,#070604)}"+
 ".fccBg b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:10px;letter-spacing:.8px;text-transform:uppercase;color:#fff}.fccBg.on b{color:var(--gold)}.fccBg span{display:block;font-size:7px;line-height:1.35;font-weight:500;color:var(--mute);margin-top:3px}"+
 ".fccLb{padding:4px 10px}.fccLbr{display:flex;align-items:center;gap:8px;padding:8px 2px;border-bottom:1px solid rgba(201,164,76,.18)}.fccLbr:last-child{border-bottom:0}"+
 ".fccLbr .rk{width:22px;font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:15px;color:var(--gold2);text-align:center}.fccLbr.top .rk{color:#ffe58a;text-shadow:0 0 8px rgba(244,201,93,.7)}"+
 ".fccLbr .nm{flex:1;min-width:0;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fccLbr .nm i{font-style:normal;font-size:7px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#1a1200;background:"+G+";padding:2px 6px;border-radius:999px;margin-left:6px}"+
 ".fccLbr .bd{display:flex;gap:4px}.fccLbr .bd b{min-width:20px;text-align:center;font-size:9px;font-weight:700;padding:3px 4px;border-radius:5px;color:#05070d}.fccLbr .bd .g{background:#39FF88}.fccLbr .bd .b{background:#4db2ff}.fccLbr .bd .w{background:#fff}"+
 ".fccLbr .pt{width:40px;text-align:right;font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:18px;color:#fff}.fccLbr.me{background:rgba(244,201,93,.1);margin:0 -10px;padding:8px 12px;border-radius:8px;border-bottom:0}"+
 ".fccKey{font-size:8.5px;font-weight:600;color:var(--mute);margin-top:8px;text-align:center}"+
 ".fccPrev{display:block;width:100%;margin:-4px 0 12px;background:"+G+";color:#1a1200;border:0;border-radius:10px;padding:12px;font:800 11px Montserrat,sans-serif;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer}"+
 ".fccPvBar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 10px;padding:9px 11px;border:1px dashed rgba(244,201,93,.7);border-radius:8px;background:rgba(0,0,0,.45);font:600 9.5px/1.4 Montserrat,sans-serif;color:#dfe6f2}.fccPvBar span{flex:1;min-width:160px}.fccPvBar b{color:var(--gold)}.fccPvBar button{background:#fff;color:#05070d;border:0;border-radius:999px;padding:7px 11px;font:800 8px Montserrat,sans-serif;letter-spacing:1.2px;text-transform:uppercase;cursor:pointer}"+
 ".fccEmpty{font-size:9.5px;color:var(--txt);padding:10px 2px}"+
 ".fcc .fccHide{display:none}@media (prefers-reduced-motion:reduce){.fccB.go{animation:none}}";
document.head.appendChild(css);
try{if(!document.getElementById("fccAnton")){var fl=document.createElement("link");fl.id="fccAnton";fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Anton&display=swap";document.head.appendChild(fl);}}catch(e){}
/* ---------- charts ---------- */
function lineChart(series,opts){
  var W=opts.W||10,x0=44,x1=590,y0=16,y1=108,mx=opts.max,mn=opts.min||0,X=function(i){return x0+(x1-x0)*i/W;},Y=function(v){return y0+(y1-y0)*(1-(v-mn)/(mx-mn));};
  var s='<svg class="fccCh" viewBox="0 0 600 136"><defs><filter id="fcclg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs>';
  (opts.ticks||[]).forEach(function(v){s+='<line x1="'+x0+'" x2="'+x1+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="#2a2417"/><text x="'+(x0-8)+'" y="'+(Y(v)+4)+'" fill="#a89f88" font-size="14" text-anchor="end" font-family="Montserrat,sans-serif">'+(opts.fmt?opts.fmt(v):v)+'</text>';});
  (opts.marks||[]).forEach(function(m){if(m.v>mx||m.v<mn)return;s+='<line x1="'+x0+'" x2="'+x1+'" y1="'+Y(m.v)+'" y2="'+Y(m.v)+'" stroke="'+(m.c||"#39FF88")+'" stroke-dasharray="4 6" stroke-width="1.2" opacity=".85"/>'+(m.l?'<text x="'+x1+'" y="'+(Y(m.v)-4)+'" fill="'+(m.c||"#39FF88")+'" font-size="12" text-anchor="end" font-family="Montserrat,sans-serif" font-weight="700">'+E(m.l)+'</text>':'');});
  var cw=TW();
  for(var w=1;w<=10;w++)s+='<text x="'+X((w-0.5)*(W/10))+'" y="130" fill="'+(w===cw?"#fff":"#4a4436")+'" font-size="13" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="700">W'+w+'</text>';
  series.forEach(function(sr){if(!sr.pts.length)return;var d="M"+sr.pts.map(function(p){return X(p.x)+","+Y(Math.max(mn,Math.min(mx,p.v)));}).join(" L");
    if(sr.dash){s+='<path d="'+d+'" fill="none" stroke="'+sr.c+'" stroke-width="1.5" stroke-dasharray="5 5" opacity=".6"/>';return;}
    if(sr.pts.length>1)s+='<path d="'+d+' L'+X(sr.pts[sr.pts.length-1].x)+','+y1+' L'+X(sr.pts[0].x)+','+y1+' Z" fill="'+sr.c+'" opacity=".10"/>';
    s+='<path d="'+d+'" fill="none" stroke="'+sr.c+'" stroke-width="9" opacity=".45" filter="url(#fcclg)" stroke-linejoin="round" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    sr.pts.forEach(function(p,i){var last=i===sr.pts.length-1;s+='<circle cx="'+X(p.x)+'" cy="'+Y(Math.max(mn,Math.min(mx,p.v)))+'" r="'+(last?5:3)+'" fill="'+(last?sr.c:"#05070d")+'" stroke="#fff" stroke-width="2"/>';});});
  return s+'</svg>';
}
function chartWt(){
  var rows=wiAll(),tgt=target(),pts=rows.map(function(r){return {x:(r.w-1)*2+(r.d?1:0)+0.5,v:r.v};});
  var vals=pts.map(function(p){return p.v;}).concat(tgt?[tgt]:[]);var f=fighter();if(!vals.length&&f&&f.weight_kg)vals=[Number(f.weight_kg)];if(!vals.length)vals=[75];
  var lo=Math.floor(Math.min.apply(null,vals))-1,hi=Math.ceil(Math.max.apply(null,vals))+1;if(hi-lo<4)hi=lo+4;
  return lineChart([{pts:pts,c:"#f4c95d"}],{W:20,min:lo,max:hi,ticks:[lo,Math.round((lo+hi)/2),hi],marks:tgt?[{v:tgt,l:"TARGET "+tgt}]:[]});
}
function chartRun(){
  var rows=runsAll(),pts=rows.map(function(r){var d=pd(r.d),w=Math.max(1,weekOf(d)),dow=(d.getDay()+6)%7;return {x:(w-1)*2+(dow>=2?1:0)+0.5,v:r.s/60};});
  var vals=pts.map(function(p){return p.v;});if(!vals.length)vals=[15];var lo=Math.floor(Math.min.apply(null,vals))-1,hi=Math.ceil(Math.max.apply(null,vals))+1;
  return lineChart([{pts:pts,c:"#ffffff"}],{W:20,min:lo,max:hi,ticks:[lo,Math.round((lo+hi)/2),hi],fmt:function(v){return v+":00";}});
}
function chartRounds(){
  var cw=TW(),pts=[{x:0,v:0}],c=0;for(var w=1;w<=cw;w++){c=roundsTotal(w);pts.push({x:w,v:c});}
  var nx=MILES.find(function(m){return c<m[0];}),mx=c>=50?80:50;
  return lineChart([{pts:pts,c:"#f4c95d"}],{max:mx,ticks:[0,mx/2,mx],marks:MILES.map(function(m){return {v:m[0],l:(nx&&m[0]===nx[0])?("NEXT · "+m[0]+" · "+m[1].toUpperCase()):(c>=m[0]?m[0]+" ✓":""),c:c>=m[0]?"#39FF88":(nx&&m[0]===nx[0]?"#f4c95d":"#2a2417")};})});
}
function chartAtt(){
  var cw=TW(),pp=[{x:0,v:0}],bp=[{x:0,v:0}],tp=[{x:0,v:0}],cp=0,cb=0;
  for(var w=1;w<=cw;w++){cp+=primDone(w);cb+=bonus(w);pp.push({x:w,v:cp});bp.push({x:w,v:cb});}
  for(var k2=1;k2<=10;k2++)tp.push({x:k2,v:k2*3});
  return lineChart([{pts:tp,c:"#8b8677",dash:true},{pts:bp,c:"#4db2ff"},{pts:pp,c:"#39FF88"}],{max:40,ticks:[0,20,40]});
}
function scoreChart(){var pts=[];for(var w=1;w<=TW();w++)pts.push({x:w-0.5,v:weekScore(w)});return lineChart([{pts:pts,c:"#f4c95d"}],{max:100,ticks:[0,50,100],marks:[{v:70,l:"SOLID WEEK · 70",c:"#39FF88"}]});}
function ring(p,c){var r=18,C=2*Math.PI*r;p=Math.max(0,Math.min(1,p||0));return '<svg class="fccRing" viewBox="0 0 44 44"><circle cx="22" cy="22" r="'+r+'" fill="none" stroke="#2a2417" stroke-width="4"/><circle cx="22" cy="22" r="'+r+'" fill="none" stroke="'+c+'" stroke-width="4" stroke-dasharray="'+(C*p)+' '+C+'" stroke-linecap="round" transform="rotate(-90 22 22)" style="filter:drop-shadow(0 0 4px '+c+')"/><text x="22" y="26" fill="#fff" font-size="11" font-weight="700" text-anchor="middle" font-family="Oswald,sans-serif">'+Math.round(p*100)+'%</text></svg>';}

/* ---------- pieces ---------- */
function tier(t){return t==="p"?'<span class="fccTier p">Primary</span>':t==="r"?'<span class="fccTier r">Highly recommended</span>':'<span class="fccTier b">Bonus</span>';}
function logBtns(w,i,kind){var d=dayOf(i),v=attVal(w,i),past=isPast(w,d)||isToday(w,d);
  var yes=kind==="sprint"?"Sprints done ✓":"I was there ✓",no=kind==="sprint"?"Skipped":"Missed it";
  if(v===1)return '<button class="fccB ok" onclick="fccAtt('+w+','+i+',0)">'+(kind==="sprint"?"Done ✓":"Trained ✓")+'</button>';
  if(v===-1)return '<button class="fccB no" onclick="fccAtt('+w+','+i+',0)">'+(kind==="sprint"?"Skipped ✗":"Missed ✗")+'</button>';
  if(!past)return '<button class="fccB off">Upcoming</button>';
  return '<div class="fccPick"><button class="fccB go" onclick="fccAtt('+w+','+i+',1)">'+yes+'</button><button class="fccB gh" onclick="fccAtt('+w+','+i+',-1)">'+no+'</button></div>';}
function exWt(w,i){var v=wt(w,i);return '<button class="'+(v?'on':'')+'" onclick="fccOpen(\'wt'+w+'_'+i+'\')"><i>Weigh-in<b>'+(v?v+' kg':'Before training')+'</b></i><em>'+(v?'Change':'Record')+'</em></button>';}
function exRun(w,i){var r=run3k(iso(dayDate(w,i))),s=r?parseTime(r.time_text):null;return '<button class="'+(s?'on':'')+'" onclick="fccOpen(\'run'+w+'_'+i+'\')"><i>3 km for time<b>'+(s?mmss(s)+(bestRun()===s?' · best':''):'Any time today')+'</b></i><em>'+(s?'Change':'Log')+'</em></button>';}
function exRounds(w,i){var n=roundsOn(iso(dayDate(w,dayOf(i))));return '<button class="'+(n?'on':'')+'" onclick="fccOpen(\'rd'+w+'_'+i+'\')"><i>Sparring rounds<b>'+(n?n+' rounds':'How many?')+'</b></i><em>'+(n?'Change':'Log')+'</em></button>';}
function frm(w,i){
  if(ST.open==="wt"+w+"_"+i)return '<div class="fccFrm"><input id="fccWtIn" type="number" step="0.1" placeholder="'+(lastWt()||'kg')+'" inputmode="decimal"><span>kg</span><button class="fccB p" onclick="fccSaveWt('+w+','+i+')">Save</button></div>';
  if(ST.open==="run"+w+"_"+i)return '<div class="fccFrm"><input id="fccRunIn" placeholder="'+(bestRun()?mmss(bestRun()):'mm:ss')+'" inputmode="numeric"><span>mm:ss</span><button class="fccB p" onclick="fccSaveRun('+w+','+i+')">Save</button></div>';
  if(ST.open==="rd"+w+"_"+i){var n=roundsOn(iso(dayDate(w,dayOf(i))));return '<div class="fccFrm"><input id="fccRdIn" type="number" min="1" max="40" step="1" placeholder="'+(n||'rounds')+'" inputmode="numeric"><span>rounds</span><button class="fccB p" onclick="fccSaveRounds('+w+','+i+')">Bank rounds</button></div>';}
  return '';
}
function ses(t,ap,n,s,tr,btn){return '<div class="fccS"><div class="t">'+t+'<small>'+ap+'</small></div><div class="n">'+tier(tr)+'<b>'+n+'</b><span>'+s+'</span></div>'+btn+'</div>';}
function dayCard(w,i,cls,name,inner){var dt=dayDate(w,i),done=attVal(w,i)===1,missed=attVal(w,i)===-1;
  var st=done?'<span class="fccSt done">Done ✓</span>':missed?'<span class="fccSt miss">Missed</span>':isToday(w,i)?'<span class="fccSt today">Today</span>':(isPast(w,i)&&cls.indexOf("b")<0)?'<span class="fccSt log">Log it</span>':'';
  return '<div class="fccDy '+cls+(isToday(w,i)?' today':'')+'"><div class="in"><div class="lab"><b>'+name+'<small>'+fd(dt)+'</small></b>'+st+'</div>'+inner+'</div></div>';}
function whoHtml(w,d,key,mine){
  var k=w+":"+d+":"+key,list=ST.who[k];
  if(!list)return '<div class="fccWall"><div class="wk2">In today</div><div class="fccAvs"><i class="more">…</i></div></div>';
  var f=fighter(),others=list.filter(function(x){return !f||x.fighter_id!==f.id;});
  if(!others.length&&!mine)return '<div class="fccWall"><div class="wk2">Nobody logged yet · be first</div></div>';
  return '<div class="fccWall"><div class="wk2">'+(mine?'You and the crew in today':'In today')+'</div><div class="fccAvs">'+(mine?'<i class="me">'+E(initials(f.first_name,f.last_name))+'</i>':'')+others.slice(0,16).map(function(x){return '<i title="'+E(x.first_name+' '+(x.last_name||''))+'">'+E(initials(x.first_name,x.last_name))+'</i>';}).join('')+(others.length>16?'<i class="more">+'+(others.length-16)+'</i>':'')+'</div></div>';
}
function headHtml(w){
  var days=Math.round((fightDate()-new Date())/864e5),cw=CW(),prim=primDone(w),snc=sncDone(w),bon=extraDone(w),pts=myPts(w).total,f=fighter();
  var logo=LOGO;
  var pvb=pv()?'<div class="fccPvBar"><span>Coach preview · seeing it as <b>'+E((f.first_name||'')+' '+(f.last_name||''))+'</b> · nothing you tap here is saved</span><button onclick="fccPreviewNext()">Next fighter</button><button onclick="fccPreview(false)">Exit</button></div>':'';
  return pvb+'<div class="fccHd"><div class="row"><div>'+(logo?'<div class="lg" style="background-image:url(\''+logo+'\')"></div>':'')+'<div><div class="k">'+E(phase(cw))+' · Camp 2026</div><h2>'+(cw===0?'Starts <span>'+fd(campStart())+'</span>':'Week <span>'+w+'</span> of 10')+'</h2></div></div><div class="cd"><b>'+Math.max(0,days)+'</b><small>days to fight night</small></div></div>'
   +'<div class="fccWk">'+[1,2,3,4,5,6,7,8,9,10].map(function(i){return '<div class="'+(i<cw?"done":i===cw?"now":"")+'"></div>';}).join("")+'</div>'
   +'<div class="fccCnt"><div><b>'+prim+'<small>/3</small></b><span>Primary<br>Mon Tue Wed</span></div><div><b>'+snc+'<small>/2</small></b><span>Strength<br>Tue Thu</span></div><div><b>'+bon+'</b><span>Bonus<br>extra credit</span></div><div class="pts"><b>'+pts+'</b><span>Points<br>camp total</span></div></div></div>'
   +'<div class="fccVw">'+[["today","Today"],["week","Week"],["prog","Progress"],["board","Board"],["rec","Recovery"]].map(function(v){return '<button class="'+(ST.view===v[0]?"on":"")+'" onclick="fccView(\''+v[0]+'\')">'+v[1]+'</button>';}).join('')+(sf()?'<button class="coach" onclick="fccTools(true)">Coach</button>':'')+'</div>';
}
function todayHtml(w){
  var d=TD(),h='';
  if(CW()<1){return '<div class="fccTn rest"><div class="k">Pre-camp</div><h3>Camp starts '+fd(campStart())+'.</h3><p>First night is <b>Monday 6:45pm, Tech &amp; drill sparring</b>. Weigh in before you train, log it here, and your ten weeks start counting.</p></div>'+coachHtml(w);}
  var list=SESS[d]||[],dt=dayDate(w,d);
  if(!list.length){
    h+='<div class="fccTn rest"><div class="k">'+DAYN[d]+' · '+fd(dt)+'</div><h3>Rest day.</h3><p>Feet up. Next up is <b>Monday 6:45pm, Tech &amp; drill sparring</b>. This week you banked <b>'+primDone(w)+' of 3</b> primary and <b>'+bonus(w)+'</b> bonus.</p></div>';
  } else {
    list.forEach(function(x,idx){
      var v=attVal(w,x.key),sp=x.sprint?SPRINTS[w-1]:null;
      h+='<div class="fccTn'+(v===1?' ok':v===-1?' no':'')+'"><div class="k">'+(idx===0?'Today · ':'Also · ')+DAYN[d]+' '+fd(dt)+'</div>'
        +'<div class="fccTr"><div class="tt">'+x.t+'<small>'+x.ap+'</small></div><div class="n">'+tier(x.tier)+'<b>'+(x.sprint?'Sprints · week '+w:x.n)+'</b><span>'+(sp?sp[0]:x.s)+'</span></div></div>'
        +'<div class="fccTb">'+logBtns(w,x.key,x.sprint?"sprint":"train")+'</div>'
        +(x.rounds?'<div class="fccEx">'+exRounds(w,2)+'</div>'+frm(w,2):'')
        +(sp?'<div class="fccNote"><b>'+E(sp[0])+'.</b> '+E(sp[1])+' Warm up 10 min easy jog and drills first.</div>':'')
        +whoHtml(w,d,x.key,v===1)+'</div>';
    });
    if(d===0||d===3)h+='<div class="fccTn"><div class="k">Before you train</div><div class="fccEx">'+exWt(w,d)+'</div>'+frm(w,d)+'</div>';
    if(d===0||d===2)h+='<div class="fccTn"><div class="k">Roadwork</div><div class="fccEx">'+exRun(w,d)+'</div>'+(d===2?'':frm(w,d))+'</div>';
    if(d===5&&SPAR_SAT_WEEKS.indexOf(w)>=0){var v5=attVal(w,15);h+='<div class="fccTn'+(v5===1?' ok':v5===-1?' no':'')+'"><div class="k">Also · Saturday sparring</div><div class="fccTr"><div class="tt">9:30<small>AM</small></div><div class="n">'+tier("b")+'<b>Sparring</b><span>On this week</span></div></div><div class="fccTb">'+logBtns(w,15,"train")+'</div><div class="fccEx">'+exRounds(w,15)+'</div>'+frm(w,15)+whoHtml(w,d,15,v5===1)+'</div>';}
  }
  var st=streak(),bs=bestStreak();
  h+='<div class="fccStrip"><div><b>'+st+'</b><span>Primary streak</span></div><div><b>'+bs+'</b><span>Best streak</span></div><div><b>'+weekScore(w)+'</b><span>Week score</span></div><div><b>'+myPts(w).total+'</b><span>Points</span></div></div>';
  return h+coachHtml(w);
}
function coachHeadHtml(w){
  var days=Math.round((fightDate()-new Date())/864e5),cw=CW(),rows=ST.boardRows||[],n=pvList().length,lead=rows.slice().sort(function(a,b){return (b.prim+b.bonus+b.runs)-(a.prim+a.bonus+a.runs);})[0];
  var d=TD(),inToday=0;if(cw>=1){(SESS[d]||[]).forEach(function(x){var l=ST.who[w+":"+d+":"+x.key];if(l)inToday=Math.max(inToday,l.length);});}
  return '<div class="fccHd"><div class="row"><div><div class="lg" style="background-image:url(\''+LOGO+'\')"></div><div><div class="k">Coach view · '+E(phase(cw))+'</div><h2>'+(cw===0?'Starts <span>'+fd(campStart())+'</span>':'Week <span>'+w+'</span> of 10')+'</h2></div></div><div class="cd"><b>'+Math.max(0,days)+'</b><small>days to fight night</small></div></div>'
   +'<div class="fccWk">'+[1,2,3,4,5,6,7,8,9,10].map(function(i){return '<div class="'+(i<cw?"done":i===cw?"now":"")+'"></div>';}).join("")+'</div>'
   +'<div class="fccCnt"><div><b>'+n+'</b><span>Fighters<br>in camp</span></div><div><b>'+inToday+'</b><span>Logged<br>today</span></div><div class="pts"><b>'+(lead?lead.prim+lead.bonus+lead.runs:0)+'</b><span>Top score<br>'+(lead?E((lead.first_name||'').split(' ')[0]):'nobody yet')+'</span></div></div></div>'
   +'<div class="fccVw">'+[["today","Today"],["board","Board"]].map(function(v){return '<button class="'+(ST.view===v[0]?"on":"")+'" onclick="fccView(\''+v[0]+'\')">'+v[1]+'</button>';}).join('')+'<button onclick="fccPreview(true)">Preview</button><button onclick="fccTools(true)">Tools</button></div>';
}
function coachTodayHtml(w){
  var d=TD(),h='';
  if(CW()<1)return '<div class="fccTn rest"><div class="k">Pre-camp</div><h3>Camp starts '+fd(campStart())+'.</h3><p>'+pvList().length+' fighters in camp. From the first Monday this screen shows who has logged each session, and the Board ranks the whole camp on points, rounds and 3 km times.</p></div>'+coachHtml(w);
  var list=SESS[d]||[],dt=dayDate(w,d);
  if(!list.length)h+='<div class="fccTn rest"><div class="k">'+DAYN[d]+' · '+fd(dt)+'</div><h3>Rest day.</h3><p>Next up is <b>Monday 6:45pm, Tech &amp; drill sparring</b>.</p></div>';
  list.forEach(function(x,idx){var sp=x.sprint?SPRINTS[w-1]:null,l=ST.who[w+":"+d+":"+x.key];
    h+='<div class="fccTn"><div class="k">'+(idx===0?'Today · ':'Also · ')+DAYN[d]+' '+fd(dt)+'</div><div class="fccTr"><div class="tt">'+x.t+'<small>'+x.ap+'</small></div><div class="n">'+tier(x.tier)+'<b>'+(x.sprint?'Sprints · week '+w:x.n)+'</b><span>'+(sp?sp[0]:x.s)+'</span></div></div>'
      +'<div class="fccWall"><div class="wk2">'+(l?l.length+' logged':'Loading')+'</div><div class="fccAvs">'+(l||[]).map(function(y){return '<i title="'+E(y.first_name+' '+(y.last_name||''))+'">'+E(initials(y.first_name,y.last_name))+'</i>';}).join('')+'</div></div></div>';});
  if(d===5&&SPAR_SAT_WEEKS.indexOf(w)>=0){var l5=ST.who[w+":"+d+":15"];h+='<div class="fccTn"><div class="k">Also · Saturday sparring 9:30am</div><div class="fccWall"><div class="wk2">'+(l5?l5.length+' logged':'Loading')+'</div><div class="fccAvs">'+(l5||[]).map(function(y){return '<i>'+E(initials(y.first_name,y.last_name))+'</i>';}).join('')+'</div></div></div>';}
  return h+coachHtml(w);
}
function coachHtml(w){var n=latestNote();if(!n)return '';return '<div class="fccCoach"><div class="k">From Jake · '+E(fd(pd(n.created_at)))+'</div><p>'+E(n.body)+'</p></div>';}
function weekHtml(w){
  var h='',sp=SPRINTS[w-1]||SPRINTS[0];
  h+=dayCard(w,0,"p","Monday",ses("6:45","PM","Tech &amp; drill sparring","Fight Club · all levels, split for rounds","p",logBtns(w,0,"train"))+'<div class="fccEx">'+exWt(w,0)+exRun(w,0)+'</div>'+frm(w,0));
  h+=dayCard(w,1,"p","Tuesday",ses("6:00","PM","Strength &amp; Con","Grunt · lift first, box after","r",logBtns(w,11,"train"))+ses("6:45","PM","Skills &amp; drills","Fight Club · no sparring, so the double works","p",logBtns(w,1,"train")));
  h+=dayCard(w,2,"p","Wednesday",ses("6:45","PM","Open sparring + bag work","Fight Club · every ring live · headgear, 16oz","p",logBtns(w,2,"train"))+'<div class="fccEx">'+exRounds(w,2)+exRun(w,2)+'</div>'+frm(w,2));
  h+=dayCard(w,3,"r","Thursday",ses("6:00","PM","Strength &amp; Con","Grunt · the second lift is where the advantage is","r",logBtns(w,3,"train"))+'<div class="fccEx">'+exWt(w,3)+'</div>'+frm(w,3));
  h+=dayCard(w,4,"b","Friday",ses("Any","","Sprints · week "+w,E(sp[0]),"b",logBtns(w,4,"sprint"))+'<div class="fccNote"><b>'+E(sp[0])+'.</b> '+E(sp[1])+' Warm up 10 min easy jog and drills first.</div>');
  var sat=SPAR_SAT_WEEKS.indexOf(w)>=0;
  h+='<div class="fccTwo">'+dayCard(w,5,"b","Saturday",ses("Any","","Any class","8am or 9am","b",logBtns(w,5,"train"))+(sat?ses("9:30","AM","Sparring","On this week","b",logBtns(w,15,"train"))+'<div class="fccEx">'+exRounds(w,15)+'</div>'+frm(w,15):'<div class="fccNote"><b>No sparring.</b> Next is '+fd(dayDate(w+1,5))+', 9:30am.</div>'))
    +dayCard(w,6,"b","Sunday",'<div class="fccNote"><b>Rest.</b> Feet up. Check your Progress tab.</div>')+'</div>';
  return h;
}
function progHtml(w){
  var prim=0,snc=0,bon=0;for(var i=1;i<=w;i++){prim+=primDone(i);snc+=sncDone(i);bon+=bonus(i);}
  var lw=lastWt(),fw=firstWt(),br=bestRun(),fr=firstRun(),rounds=roundsTotal(),spr=sprintsDone(),nx=MILES.find(function(m){return rounds<m[0];});
  var pj=projectWt(),tgt=target(),daysLeft=Math.max(0,Math.round((fightDate()-new Date())/864e5));
  var h='<div class="fccTiles">'
   +'<div class="fccTile p"><div class="k">Primary sessions</div><div class="v">'+prim+'<small>/ '+(w*3)+'</small></div><div class="s">Mon Tue Wed 6:45pm · <b>'+Math.round(prim/(w*3)*100)+'%</b> so far</div>'+ring(prim/(w*3),"#39FF88")+'</div>'
   +'<div class="fccTile r"><div class="k">Bonus sessions</div><div class="v">'+bon+'</div><div class="s"><b>'+snc+'</b> Strength &amp; Con · <b>'+(bon-snc)+'</b> extras</div>'+ring(bon/(w*4),"#4db2ff")+'</div></div><div class="fccTiles three">'
   +'<div class="fccTile"><div class="k">Sparring rounds</div><div class="v">'+rounds+'</div><div class="s">'+(nx?'Next unlock at '+nx[0]:'All unlocked')+'</div></div>'
   +'<div class="fccTile"><div class="k">Best 3 km</div><div class="v">'+(br?mmss(br):'–')+'</div><div class="s">'+(br&&fr&&fr>br?'<b>'+mmss(fr-br)+' quicker</b>':br?'Keep chasing it':'Run it Monday')+'</div></div>'
   +'<div class="fccTile"><div class="k">Weight</div><div class="v">'+(lw||'–')+'<small>kg</small></div><div class="s">'+(lw&&fw?'<b>'+(fw-lw).toFixed(1)+' kg down</b>':'weigh in Monday')+'</div></div></div>';
  var last=w>1?weekScore(w-1):null,cur=weekScore(w);
  h+='<div class="fccSec"><b>Week score</b><span>You against last week</span></div><div class="fccCard"><div class="row"><h3>'+cur+' this week</h3><span class="fccTg">'+(last==null?'First week':cur>last?'Up '+(cur-last)+' on last week':cur===last?'Level with last week':(last-cur)+' behind last week')+'</span></div>'+scoreChart()+'<p>20 a primary night, 7 a bonus session, 8 a run, 2 a weigh-in. <b>70 is a solid week.</b> Beat your own number, that is the whole game.</p></div>';
  h+='<div class="fccSec"><b>Weight</b><span>Mon &amp; Thu weigh-ins · 10 weeks</span></div><div class="fccCard"><div class="row"><h3>'+(lw?lw+' kg':'No weigh-in yet')+'</h3><span class="fccTg" onclick="fccSetTarget()" style="cursor:pointer">'+(tgt?(lw?(lw-tgt).toFixed(1)+' kg to target':'Target '+tgt+' kg'):'Set fight weight')+'</span></div>'+chartWt()
    +(pj&&tgt?'<p>'+(pj.fight<=tgt+0.2?'<b>On track.</b> At this rate you weigh in around <b>'+pj.fight.toFixed(1)+' kg</b> on fight night, under your '+tgt+' kg target.':'<b>Behind the curve.</b> At this rate you land around <b>'+pj.fight.toFixed(1)+' kg</b> on fight night, over your '+tgt+' kg target by '+(pj.fight-tgt).toFixed(1)+' kg. '+daysLeft+' days to fix it.')+'</p>':pj?'<p>Trending <b>'+(pj.m<0?(-pj.m*7).toFixed(2)+' kg a week down':(pj.m*7).toFixed(2)+' kg a week up')+'</b>. Set a fight weight to see where you land.</p>':'<p>Two weigh-ins and this starts projecting your fight-night weight.</p>')+'</div>';
  h+='<div class="fccSec"><b>3 km for time</b><span>Mon &amp; Wed · same route</span></div><div class="fccCard"><div class="row"><h3>'+(br?'Best '+mmss(br):'No run yet')+'</h3><span class="fccTg">'+spr+' / 10 Friday sprints</span></div>'+chartRun()+'<p>Chase the time down. Friday sprints build the top end, the Mon and Wed runs show it.</p></div>';
  h+='<div class="fccSec"><b>Sparring rounds</b><span>Banked over the camp</span></div><div class="fccCard"><div class="row"><h3>'+rounds+' rounds banked</h3><span class="fccTg">'+(nx?(nx[0]-rounds)+' to '+nx[1].toLowerCase():'Fight singlet earned')+'</span></div>'+chartRounds()+'<p>'+MILES.map(function(m){return (rounds>=m[0]?'✓ ':'')+m[0]+' · '+m[1];}).join(' &nbsp;·&nbsp; ')+'</p></div>';
  h+='<div class="fccSec"><b>Attendance</b><span><i class="lg g"></i>Primary <i class="lg b"></i>Bonus</span></div><div class="fccCard"><div class="row"><h3>'+prim+' of '+(w*3)+' primary</h3><span class="fccTg">'+bon+' bonus</span></div>'+chartAtt()+'<p><b>Green</b> is Mon, Tue, Wed 6:45pm. <b>Blue</b> is everything extra. The dashed line is every primary session. <b>Stay on it.</b></p></div>';
  return h;
}
function boardHtml(w){
  var tab=ST.board,rows=ST.boardRows,f=fighter();
  var h='<div class="fccVw sub"><button class="'+(tab==="pts"?"on":"")+'" onclick="fccBoard(\'pts\')">Points</button><button class="'+(tab==="rounds"?"on":"")+'" onclick="fccBoard(\'rounds\')">Rounds</button><button class="'+(tab==="run"?"on":"")+'" onclick="fccBoard(\'run\')">3 km</button></div>';
  if(!rows)return h+'<div class="fccEmpty">Loading the board…</div>';
  var list=rows.map(function(r){var me=f&&r.fighter_id===f.id;return {name:(r.first_name||'')+' '+(r.last_name||''),me:me,p:r.prim,b:r.bonus,r:r.runs,pts:r.prim+r.bonus+r.runs,rounds:r.rounds,best:r.best_sec};});
  if(tab==="pts")list.sort(function(a,b){return b.pts-a.pts||b.p-a.p;});
  else if(tab==="rounds")list.sort(function(a,b){return b.rounds-a.rounds;});
  else list.sort(function(a,b){return (a.best||9999)-(b.best||9999);});
  var rank=list.findIndex(function(r){return r.me;})+1;
  h+='<div class="fccSec"><b>'+(tab==="pts"?"Points":tab==="rounds"?"Sparring rounds":"Best 3 km")+'</b><span>'+(rank?'You are <b>#'+rank+'</b> of '+list.length:list.length+' fighters')+'</span></div><div class="fccCard fccLb">';
  list.forEach(function(r,i){var val=tab==="pts"?r.pts:tab==="rounds"?r.rounds:(r.best?mmss(r.best):'–');
    h+='<div class="fccLbr'+(r.me?' me':'')+(i<3?' top':'')+'"><span class="rk">'+(i+1)+'</span><span class="nm">'+E(r.name)+(r.me?' <i>you</i>':'')+'</span><span class="bd">'+(tab==="pts"?'<b class="g">'+r.p+'</b><b class="b">'+r.b+'</b><b class="w">'+r.r+'</b>':'')+'</span><span class="pt">'+val+'</span></div>';});
  h+='</div>'+(tab==="pts"?'<p class="fccKey"><i class="lg g"></i>primary <i class="lg b"></i>bonus <i class="lg w"></i>runs · 1 point each</p>':'');
  return h;
}
/* ---------- loaders (aggregates via fc_board / fc_who_in) ---------- */
var loading={};
function loadWho(w,d,keys){
  keys.forEach(function(key){var k=w+":"+d+":"+key;if(ST.who[k]||loading[k])return;loading[k]=true;
    sb.rpc("fc_who_in",{p_camp:CAMP,p_week:w,p_day:key}).then(function(r){loading[k]=false;ST.who[k]=r.error?[]:(r.data||[]);repaint();},function(){loading[k]=false;});});
}
function loadBoard(force){
  if(!force&&ST.boardRows&&Date.now()-ST.boardAt<60000)return;if(loading.board)return;loading.board=true;
  sb.rpc("fc_board",{p_camp:CAMP}).then(function(r){loading.board=false;ST.boardRows=r.error?[]:(r.data||[]);ST.boardAt=Date.now();repaint();},function(){loading.board=false;});
}
function dirty(){ST.who={};ST.boardRows=null;}

/* ---------- paint ---------- */
function active(){try{if(view!=="fc"||!fc()||!fc().loaded)return false;if(cm()||sf())return true;return (!staff()||ST.preview)&&!!fighter()&&(fc().tab==="camp"||fc().tab==="progress");}catch(e){return false;}}
function previewBtn(){try{if(!(view==="fc"&&staff()&&!ST.preview&&ST.tools&&fc()&&fc().loaded))return;var box=document.querySelector("#main .fcx");if(!box||box.querySelector("#fccPrev"))return;var pills=box.querySelector(".pills");if(!pills)return;var b=document.createElement("button");b.id="fccPrev";b.className="fccPrev";b.textContent="\u2039 Back to Camp";b.onclick=function(){window.fccTools(false);};pills.insertAdjacentElement("afterend",b);}catch(e){}}
function trimPills(){try{if(!staff()||view!=="fc")return;var pills=document.querySelector("#main .fcx .pills");if(!pills||pills.getAttribute("data-trim"))return;
  [].slice.call(pills.querySelectorAll("button")).forEach(function(b){var o=b.getAttribute("onclick")||"";if(/'proam'|'train'|'spar'|'progress'|'fight'/.test(o))b.parentNode.removeChild(b);
    else if(/'camp'/.test(o)){b.setAttribute("onclick","fccTools(false)");b.textContent="Camp";}});
  pills.setAttribute("data-trim","1");}catch(e){}}
function frameSync(){try{var on=active()&&!!document.querySelector("#main .fcx #fcc");var pf=document.getElementById("fccPF");if(on&&!pf){pf=document.createElement("div");pf.id="fccPF";pf.className="fccPF";document.body.appendChild(pf);}else if(!on&&pf)pf.parentNode.removeChild(pf);}catch(e){}}
var painting=false;
function paint(force){
  if(!active())return;
  var box=document.querySelector("#main .fcx");if(!box)return;
  if(box.querySelector("#fcc")&&!force)return;
  if(painting)return;painting=true;
  try{
    if(fc().tab==="progress"&&!force)ST.view="prog";
    var w=TW();ST.wk=w;
    var pills=box.querySelector(".pills");
    var wrap=box.querySelector("#fcc");if(!wrap){wrap=document.createElement("div");wrap.id="fcc";wrap.className="fcc";
      var n=pills?pills.nextSibling:null;while(n){var nx=n.nextSibling;n.parentNode.removeChild(n);n=nx;}
      (pills||box).insertAdjacentElement("afterend",wrap);}
    if(sf()&&pills)pills.style.display="none";
    if(cm()){if(pills)pills.style.display="none";if(ST.view==="prog"||ST.view==="week")ST.view="today";var cbody=ST.view==="board"?boardHtml(w):coachTodayHtml(w);wrap.innerHTML='<div data-fct="plan" class="fccHide"></div><div data-fct="wt" class="fccHide"></div>'+coachHeadHtml(w)+cbody;}
    else{if(pills&&!sf())pills.style.display="";var body=ST.view==="prog"?progHtml(w):ST.view==="board"?boardHtml(w):ST.view==="week"?weekHtml(w):(ST.view==="rec"&&window.fcRecHtml)?window.fcRecHtml(w):todayHtml(w);
    wrap.innerHTML='<div data-fct="plan" class="fccHide"></div><div data-fct="wt" class="fccHide"></div>'+headHtml(w)+body;}
    var inp=document.getElementById("fccWtIn")||document.getElementById("fccRunIn")||document.getElementById("fccRdIn");if(inp)try{inp.focus();}catch(e){}
    if(ST.view==="rec"&&window.fcRecAfter)try{window.fcRecAfter();}catch(e){}
    if(ST.view==="today"&&CW()>=1){var d=TD(),keys=(SESS[d]||[]).map(function(x){return x.key;});if(d===5&&SPAR_SAT_WEEKS.indexOf(w)>=0)keys.push(15);if(keys.length)loadWho(w,d,keys);}
    if(cm()&&ST.view==="today")loadBoard();
    if(ST.view==="board")loadBoard();
  }catch(e){console.warn("fccamp",e);}
  finally{painting=false;}
  frameSync();
}
function repaint(){paint(true);}

/* ---------- actions ---------- */
window.fccFighter=fighter;window.fccPv=pv;window.fccRepaint=repaint;
window.fccView=function(v){ST.view=v;ST.open=null;try{localStorage.setItem("fccView",v);}catch(e){}try{if(!cm()&&!sf())window.FC.tab=v==="prog"?"progress":"camp";}catch(e){}repaint();try{window.scrollTo(0,0);}catch(e){}};
window.fccBoard=function(t){ST.board=t;repaint();};
window.fccTools=function(on){ST.tools=!!on;var w=document.getElementById("fcc");if(w)w.parentNode.removeChild(w);var b=document.getElementById("fccPrev");if(b)b.parentNode.removeChild(b);var box=document.querySelector("#main .fcx .pills");if(box)box.style.display="";frameSync();try{fcxSet("tab",on?"fighters":"camp");}catch(e){}if(!on){ST.view="today";repaint();}else{var pl=document.querySelector("#main .fcx .pills");if(pl)pl.removeAttribute("data-trim");}try{window.scrollTo(0,0);}catch(e){}};
window.fccOpen=function(k){ST.open=ST.open===k?null:k;repaint();};
window.fccPreview=function(on){ST.preview=!!on;ST.pf=null;dirty();try{localStorage.setItem("fcwPreview",on?"1":"0");}catch(e){}var w=document.getElementById("fcc");if(w)w.parentNode.removeChild(w);var b=document.getElementById("fccPrev");if(b)b.parentNode.removeChild(b);frameSync();ST.view="today";try{fcxSet("tab","camp");}catch(e){}repaint();try{window.scrollTo(0,0);}catch(e){}};
window.fccPreviewNext=function(){var L=pvList();if(!L.length)return;var i=L.findIndex(function(x){return ST.pf&&x.id===ST.pf.id;});ST.pf=L[(i+1)%L.length];ST.open=null;dirty();repaint();};
window.fccAtt=async function(w,i,v){if(pv()){T("Preview only · nothing saved");return;}
  var f=fighter();if(!f)return;var cur=attRow(w,i),d=iso(dayDate(w,dayOf(i)));
  if(!v){if(cur){var del=await sb.from("fc_attendance").delete().eq("id",cur.id);if(del.error){T("Couldn't change that");return;}fc().att=fc().att.filter(function(x){return x.id!==cur.id;});}T("Cleared · log it again");dirty();repaint();return;}
  var r=await sb.from("fc_attendance").upsert({camp:CAMP,fighter_id:f.id,week:w,day:i,attended:v===1,session_date:d,logged_by:me()},{onConflict:"camp,fighter_id,week,day"}).select().maybeSingle();
  if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().att=(fc().att||[]).filter(function(x){return !(x.fighter_id===f.id&&x.week===w&&x.day===i);});fc().att.push(r.data);
  var st=streak();T(v===1?(i===4?"Sprints done ✓":st>=3?"Banked ✓ · "+st+" primary in a row":"Session banked ✓"):"Logged as missed");dirty();repaint();
};
window.fccSaveWt=async function(w,i){if(pv()){T("Preview only · nothing saved");return;}
  var f=fighter(),v=parseFloat((document.getElementById("fccWtIn")||{}).value);if(!(v>30&&v<250)){T("Type your weight in kg");return;}
  var day=i===3?3:0;
  var r=await sb.from("fc_weighins").upsert({camp:CAMP,fighter_id:f.id,week:w,day:day,weight_kg:v},{onConflict:"camp,fighter_id,week,day"}).select().maybeSingle();
  if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().wi=(fc().wi||[]).filter(function(x){return !(x.fighter_id===f.id&&x.week===w&&(x.day||0)===day);});fc().wi.push(r.data);ST.open=null;T(v+" kg recorded ✓");repaint();
};
window.fccSaveRun=async function(w,i){if(pv()){T("Preview only · nothing saved");return;}
  var f=fighter(),txt=(document.getElementById("fccRunIn")||{}).value,s=parseTime(txt);if(!s||s<300||s>3600){T("Time as mm:ss, e.g. 14:30");return;}
  var d=iso(dayDate(w,i)),old=run3k(d);
  if(old){await sb.from("fc_runs").delete().eq("id",old.id);fc().runs=fc().runs.filter(function(x){return x.id!==old.id;});}
  var r=await sb.from("fc_runs").insert({camp:CAMP,fighter_id:f.id,run_date:d,km:3,time_text:mmss(s)}).select().maybeSingle();
  if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().runs=(fc().runs||[]).concat([r.data]);ST.open=null;var b=bestRun();T("3 km · "+mmss(s)+(b===s?" · new best 🔥":" ✓"));dirty();repaint();
};
window.fccSaveRounds=async function(w,i){if(pv()){T("Preview only · nothing saved");return;}
  var f=fighter(),d=iso(dayDate(w,dayOf(i))),n=parseInt((document.getElementById("fccRdIn")||{}).value,10);if(!(n>0&&n<=40)){T("How many rounds? Type a number");return;}
  var ex=(fc().rounds||[]).filter(function(r){return r.fighter_id===f.id&&r.night_date===d;});
  if(ex.some(function(r){return r.created_by!==me();})){T("Jake logged that night · ask him to change it");return;}
  if(ex.length){var del=await sb.from("fc_spar_rounds").delete().eq("fighter_id",f.id).eq("night_date",d);if(del.error){T("Couldn't replace that night");return;}fc().rounds=fc().rounds.filter(function(r){return !(r.fighter_id===f.id&&r.night_date===d);});}
  var lvl=w>=sparOpenWeek()?"Live":"Technical",rows=[];for(var k=1;k<=n;k++)rows.push({camp:CAMP,fighter_id:f.id,night_date:d,round_no:k,opponent_id:null,level:lvl,created_by:me()});
  var r=await sb.from("fc_spar_rounds").insert(rows).select();if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().rounds=(fc().rounds||[]).concat(r.data||[]);
  try{var a=await sb.from("fc_attendance").upsert({camp:CAMP,fighter_id:f.id,week:w,day:i,attended:true,session_date:d,logged_by:me()},{onConflict:"camp,fighter_id,week,day"}).select().maybeSingle();if(!a.error&&a.data){fc().att=(fc().att||[]).filter(function(x){return !(x.fighter_id===f.id&&x.week===w&&x.day===i);});fc().att.push(a.data);}}catch(e){}
  ST.open=null;var tot=roundsTotal(),hit=MILES.find(function(m){return tot>=m[0]&&tot-n<m[0];});T(hit?tot+" rounds · "+hit[1]+" unlocked 🔥":n+" rounds banked ✓ ("+tot+" total)");dirty();repaint();
};
window.fccSetTarget=async function(){if(pv()){T("Preview only · nothing saved");return;}
  var f=fighter(),v=parseFloat(prompt("Fight weight target in kg",target()||""));if(!(v>30&&v<250))return;
  var r=await sb.rpc("fc_set_target",{p_camp:CAMP,p_kg:v});if(r.error){T("Couldn't save the target");return;}
  f.fight_weight_kg=v;T("Target "+v+" kg");repaint();
};

/* ---------- hooks ---------- */
["fcxSet"].forEach(function(fn){var o=window[fn];if(typeof o!=="function")return;window[fn]=function(k,v){if(k==="tab"&&staff()&&v==="fighters"&&!ST.tools){ST.tools=true;try{localStorage.setItem("fccTools","1");}catch(e){}var w0=document.getElementById("fcc");if(w0)w0.parentNode.removeChild(w0);}if(k==="tab"&&!cm()&&!sf()){if(v==="progress")ST.view="prog";if(v==="camp"&&ST.view==="prog")ST.view="today";}var r=o.apply(this,arguments);try{paint();setTimeout(paint,60);}catch(e){}return r;};});
try{var mo=new MutationObserver(function(){try{trimPills();paint();frameSync();previewBtn();}catch(e){}});var mainEl=document.getElementById("main");if(mainEl)mo.observe(mainEl,{childList:true});}catch(e){}
setInterval(function(){try{trimPills();paint();frameSync();previewBtn();}catch(e){}},400);
})();
