var markerHome;
var markerBusUC;
var markerBusDT;
var bounds = new google.maps.LatLngBounds();
var infowindow = new google.maps.InfoWindow(); 

var streetName = getCookie("streetName");
var streetNum = getCookie("streetNum");

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
    }
}

function getParkData() {
    $.ajax({
        url: "/api/park/"+ streetNum + "/" + streetName,
        success: function(response) {
			var markerPark = new Array();
            for(var i = 0; i < response.data.length; i++) {
                var park = response.data[i];
                //console.log(park);
                var parkCard = $('<div class="parkCard"></div>');
                parkCard.html($("<h3>" + park.ParkName + "</h3>"));
                parkCard.append($("<p class='address'>" + park.Address + "</p>"));
				var parkCardHidden = $("<div class='hiddenDetails'></div>");
				
				parkCardHidden.html($("<h3>" + park.ParkName + "</h3>"));
                parkCardHidden.append($("<p class='address'>" + park.Address + "</p>"));
				
				var parkCardHiddenTable = $("<table></table>");
				parkCardHiddenTable.append("<tr><th>Ammenity</th><th>#</th></tr>");
				
				for (var key in park) {
				  if (park.hasOwnProperty(key) && key != "Address" && key != "ParkName" && key != "id" && key != "createdAt" && key != "updatedAt" && key != "distance" && key != "Area") {
					parkCardHiddenTable.append("<tr><td class='cat'>" + key + "</td><td class='num'>" + park[key] + "</td></tr>");
				  } else if(park.hasOwnProperty(key) && key == "Area") {
					parkCardHiddenTable.append("<tr><td class='cat'>" + key + "</td><td class='num'>" + park[key] + " km<sup>2</sup></td></tr>");
				  } else if(park.hasOwnProperty(key) && key == "distance") {
					parkCardHiddenTable.append("<tr><td class='cat'>Distance</td><td class='num'>" + parseFloat(Math.round(park[key] * 100) / 100).toFixed(2) + " km</td></tr>");
				  } 
				}
				
				parkCardHidden.append(parkCardHiddenTable);
				parkCard.append(parkCardHidden);
				parkCard.click(function () {
					loadGalleryColorbox($(this));
				});
				
                $("#parksSection").append(parkCard);
				
				markerPark[i] = new google.maps.Marker({
					position: new google.maps.LatLng(park.Latitude, park.Longitude),
					map: map,
					icon: "public/images/icon-park.png",
					title: park.ParkName
					
				});
				//console.log(markerPark[i]);
				//bounds.extend(markerPark.position);
				google.maps.event.addListener(markerPark[i], 'click', (function(marker, i) {
					return function() {
					  infowindow.setContent(marker.title);
					  infowindow.open(map, marker);
					}
				})(markerPark[i], i));
            }
        },
        failure: function(response) {
            alert("AJAX failed!");
        }
    });
}

function changeTimes(dropdown) {
    if(dropdown == null) {
        return "";
    }
    if(dropdown.value == "downtown") {
        markerBusUC.setMap(null);
        markerBusDT.setMap(map);
        if(busDT != null) {
            var busTimeOne = busDT.times[0] == null ? "" : busDT.times[0].timeDiff;
            var busTimeTwo = busDT.times[1] == null ? "" : busDT.times[1].timeDiff;
            var busTimeThree = busDT.times[2] == null ? "" : busDT.times[2].timeDiff;

            $("#routeName").text(busDT.routeName);
            $("#stopName").text(busDT.stop_name);
            $("#transitNextTimes").html($("<p>Time until next bus => <span class='big'>" + busTimeOne + "</span><span class='med'>" + busTimeTwo + "</span><span class='small'>" + busTimeThree + "</span>"));
        } else {
            $("#routeName").text("N/A");
            $("#stopName").text("N/A");
            $("#transitNextTimes").html($("<p class='error'>Error, no bus goes straight to downtown from nearby that address</p>"));
        }
    } else {
        markerBusUC.setMap(map);
        markerBusDT.setMap(null);
        if(busUC != null) {
            var busTimeOne = busUC.times[0] == null ? "" : busUC.times[0].timeDiff;
            var busTimeTwo = busUC.times[1] == null ? "" : busUC.times[1].timeDiff;
            var busTimeThree = busUC.times[2] == null ? "" : busUC.times[2].timeDiff;

            $("#routeName").text(busUC.routeName);
            $("#stopName").text(busUC.stop_name);
            $("#transitNextTimes").html($("<p>Time until next bus => <span class='big'>" + busTimeOne + "</span><span class='med'>" + busTimeTwo + "</span><span class='small'>" + busTimeThree + "</span>"));
        } else {
            $("#routeName").text("N/A");
            $("#stopName").text("N/A");
            $("#transitNextTimes").html($("<p class='error'>Error, no bus goes straight to the University Centre from nearby that address</p>"));
        }
    }
}

function getTransitData() {
    $.ajax({
        url: "/api/bus/"+ streetNum + "/" + streetName,
        success: function(response) {
            
            busDT = response.data.dt;
            busUC = response.data.uc;
            var transitCard = $('<div class="transitCard card"></div>');
            var dropdown = $("<span>Select your destination => </span><select onChange='changeTimes(this)'><option selected value='school'>University Centre</option><option value='downtown'>Downtown</option></select>");
            transitCard.html(dropdown);
            transitCard.append($("<p>Route Number => <span id='routeName'>" + busUC.routeName + "</span></p>"));
            transitCard.append($("<p>Stop Name => <span id='stopName'>" + busUC.stop_name + "</span></p>"));
            transitCard.append("<div id='transitNextTimes'></div>");

            markerHome = new google.maps.Marker({
                position: new google.maps.LatLng(response.data.latLong.lat, response.data.latLong.lng),
                map: map,
				icon: "public/images/icon-home.png",
                title: "Home"
            });
            bounds.extend(markerHome.position);
            google.maps.event.addListener(markerHome, 'click', (function(marker, i) {
                return function() {
                  infowindow.setContent(markerHome.title);
                  infowindow.open(map, markerHome);
                }
            })(markerHome, 0));

            markerBusUC = new google.maps.Marker({
                position: new google.maps.LatLng(busUC.latitude, busUC.longitude),
                map: map,
                title: busUC.stop_name
            });
            bounds.extend(markerBusUC.position);
            google.maps.event.addListener(markerBusUC, 'click', (function(marker, i) {
                return function() {
                  infowindow.setContent(markerBusUC.title);
                  infowindow.open(map, markerBusUC);
                }
            })(markerBusUC, 1));

            markerBusDT = new google.maps.Marker({
                position: new google.maps.LatLng(busDT.latitude, busDT.longitude),
                map: map,
                title: busDT.stop_name
            });
            bounds.extend(markerBusDT.position);
            google.maps.event.addListener(markerBusDT, 'click', (function(marker, i) {
                return function() {
                  infowindow.setContent(markerBusDT.title);
                  infowindow.open(map, markerBusDT);
                }
            })(markerBusDT, 2));

            setTimeout(function() { markerHome.setMap(map); changeTimes(dropdown); map.fitBounds(bounds);},100);            

            $("#transitSection").append(transitCard);
        },
        failure: function(response) {
            alert("AJAX failed!");
        }
    });
}

function getWasteData() {
            //$scope.streets = ["College W.", "Southcreek Trail", "Stone Rd."];

    $.ajax({
        url: "/api/garbage/" + streetNum + "/" + streetName.toUpperCase(),
        success: function(response) {
            //console.log(response);
            var wasteResult = response.data;

            var wasteCard = $('<div class="wasteCard card"></div>');
            wasteCard.html($("<p>Pickup Day => " + wasteResult.day + "</p>"));
            wasteCard.append($("<p>Pickup System => " + wasteResult.type + "</p>"));
            //wasteCard.append($("<p>Week => " + wasteResult.week + "</p>"));                

            wasteCard.append("<p>To go out this week:</p>");
            if(wasteResult.recycleDay == true) {
                wasteCard.append("<div class='wasteWeek'><span class='circle compost'></span> Compost <span class='circle recycling'></span> Recycling</div>");
            } else {
                wasteCard.append("<div class='wasteWeek'><span class='circle compost'></span> Compost <span class='circle waste'></span> Waste</div>");
            }

            $("#wasteSection").append(wasteCard);
        }
    });
}

/* ---------- Loading gallery detail pages inline --------------- */
function loadGalleryColorbox(clickedItem) {
  	$("#popUpBoxBackground").remove();
  	$("#popUpBox").remove();

  	var popUpBox = $("<div id='popUpBox'></div>");
  	var popUpBoxBackground = $("<div id='popUpBoxBackground'></div>");
  	var closeBox = $("<div id='closeBox'><span>X</span> close</div>");
  	var innerContainer = $("<div class='popupContainer'></div>");
  
  	
  	innerContainer.html(clickedItem.find(".hiddenDetails").html());    
  
  	closeBox.click(function(){ 
      	popUpBoxBackground.fadeOut(300, function() {$(this).remove();})  
      	popUpBox.fadeOut(300, function() {$(this).remove();})  
    });
  
  	popUpBoxBackground.click(function(){ 
      	popUpBoxBackground.fadeOut(300, function() {$(this).remove();})  
      	popUpBox.fadeOut(300, function() {$(this).remove();})  
    });
  
  	popUpBox.html(closeBox);
  	popUpBox.append(innerContainer);
  
    $("body").append(popUpBoxBackground); 	
    $("body").append(popUpBox); 

  
  	popUpBoxBackground.fadeIn(300);
  	popUpBox.fadeIn(300, function() {});
}

    var availableTags = ["ABBEYWOOD CRES",
"ABERDEEN ST",
"ACORN PL",
"ADMIRAL PL",
"AIRPARK PL",
"AJAX ST",
"ALBERT ST",
"ALEXANDRA ST",
"ALGOMA DR",
"ALGONQUIN DR",
"ALICE ST",
"ALLAN AVE",
"ALLISON PL",
"ALMA ST N",
"ALMA ST S",
"AMALIA CRES",
"AMBERWOOD LANE",
"AMSTERDAM CRES",
"ANN ST",
"ANTHONY AVE",
"APPLEWOOD CRES",
"ARBORDALE WALK",
"ARBORETUM RD",
"ARDMAY CRES",
"ARGYLE DR",
"ARKELL RD",
"ARMSTRONG AVE",
"ARNOLD ST",
"ARROW RD",
"ARROW WOOD CRT",
"ARTHUR ST N",
"ARTHUR ST S",
"ASHCROFT CRT",
"ASPEN VALLEY CRES",
"ASPENWOOD PL",
"ATTO DR",
"AUDEN RD",
"AUDREY AVE",
"AUGUSTINE CRT",
"AVONDALE AVE",
"AVRA CRT",
"BAGOT ST",
"BAILEY AVE",
"BAKER ST",
"BALFOUR CRT",
"BALMORAL DR",
"BALSAM DR",
"BALSARROCH PL",
"BARBER AVE",
"BARD BLVD",
"BARTON ST",
"BASSWOOD DR",
"BATES RD",
"BATHGATE DR",
"BAYBERRY DR",
"BEATTIE ST",
"BEAUMONT CRES",
"BEAVER MEADOW DR",
"BEECHLAWN BLVD",
"BEECHWOOD AVE",
"BELCOURT CRES",
"BELL AVE",
"BELLEVUE ST",
"BENNETT AVE",
"BERKLEY PL",
"BERRY DR",
"BEVERLEY ST",
"BIRCH ST",
"BIRCHBANK BLVD",
"BIRMINGHAM ST",
"BISHOP CRT",
"BLACKBIRD CRES",
"BLAIR DR",
"BLUERIDGE CRT",
"BONAR PL",
"BOND CRT",
"BORDEN ST",
"BORLAND DR",
"BOULDER CRES",
"BOULT AVE",
"BOWEN DR",
"BRADSON DR",
"BRADY LANE",
"BRAID PL",
"BRANT AVE",
"BRAZOLOT DR",
"BREESEGARDEN LANE",
"BRENTWOOD DR",
"BRIARLEA RD",
"BRIDLEWOOD DR",
"BRIGHT LANE",
"BRIGHTON ST",
"BRISTOL ST",
"BROCKVILLE AVE",
"BROMBAL DR",
"BROOKHAVEN CRT",
"BROWN ST",
"BROWNYN PL",
"BRUNSWICK AVE",
"BRYDGES CRT",
"BUCKTHORN CRES",
"BURKE CRT",
"BURNS DR",
"BURTON RD",
"BUSHMILLS CRES",
"BYRON CRT",
"CABOT CRT",
"CADILLAC DR",
"CALEDONIA ST",
"CALGARY AVE",
"CALLANDER DR",
"CAMBRIDGE ST",
"CAMM CRES",
"CAMPBELL RD",
"CAMPION AVE",
"CANDLEWOOD DR",
"CANNON ST",
"CARDEN ST",
"CARDIFF WAY",
"CARDIGAN ST",
"CARERE CRES",
"CAREY CRES",
"CARIBOU CRES",
"CARLAW PL",
"CARMINE PL",
"CARNABY CRES",
"CAROLYN CRT",
"CARRINGTON DR",
"CARRINGTON PL",
"CARROLL CRES",
"CARTER DR",
"CASSINO AVE",
"CASTLEBURY DR",
"CATHCART ST",
"CAVELL AVE",
"CEDAR ST",
"CEDARCROFT PL",
"CEDARVALE AVE",
"CELIA CRES",
"CENTRAL ST",
"CHAD PL",
"CHADWICK AVE",
"CHAMPLAIN PL",
"CHAPEL LANE",
"CHARLES ST",
"CHARTWELL CRES",
"CHASE AVE",
"CHELSEA CRT",
"CHELTONWOOD AVE",
"CHERRY BLOSSOM CIR",
"CHERRYWOOD DR",
"CHESTER ST",
"CHESTERFIELD AVE",
"CHESTERTON LANE",
"CHESTNUT PL",
"CHILLICO DR",
"CHRISTIE LANE",
"CHRISTOPHER CRT",
"CHURCH LANE",
"CITYVIEW DR N",
"CITYVIEW DR S",
"CLAIR RD E",
"CLAIR RD W",
"CLAIRFIELDS DR E",
"CLAIRFIELDS DR W",
"CLARA ST",
"CLARENCE ST",
"CLARK ST E",
"CLARK ST W",
"CLEARVIEW ST",
"CLINTON ST",
"CLIVE AVE",
"CLOUGH CRES",
"CLYTHE CREEK DR",
"COLBORN ST",
"COLE RD",
"COLLEGE AVE E",
"COLLEGE AVE W",
"COLLEGE CRES",
"COLLINGWOOD ST",
"COLONIAL DR",
"COLUMBUS CRES",
"COMMERCIAL ST",
"CONRAD CRT",
"CONROY CRES",
"COOPERS CRT",
"COPE CRT",
"CORK ST E",
"CORK ST W",
"CORPORATE CRT",
"COTE DR",
"COUNTRY CLUB DR",
"COUTTS CRT",
"COVENTRY DR",
"COWAN PL",
"CRANBERRY CRT",
"CRANE AVE",
"CRAWFORD ST",
"CRAWLEY RD",
"CREEKSIDE DR",
"CRESTWOOD PL",
"CRIMEA ST",
"CROSS ST",
"CROSSINGHAM DR",
"CROWE ST",
"CUMMINGS CRT",
"CURTIS DR",
"CURZON CRES",
"CUTTEN PL",
"DAKOTA DR",
"DALEBROOK PL",
"DANWOOD PL",
"DARBY RD",
"DARLING CRES",
"DARNELL RD",
"DAVIS ST",
"DAVISON DR",
"DAWN AVE",
"DAWSON RD",
"DEAN AVE",
"DEERCHASE CRT",
"DEERFIELD PL",
"DEERPATH DR",
"DELAWARE AVE",
"DELHI ST",
"DELMAR BLVD",
"DELTA ST",
"DENVER RD",
"DERRY ST",
"DESHANE ST",
"DEVERE DR",
"DEVONSHIRE PL",
"DIMSON AVE",
"DIVISION ST",
"DODDS AVE",
"DOMINION DR",
"DOMO DR",
"DOOLEY PL",
"DORMIE LANE",
"DOUGLAS ST",
"DOVERCLIFFE RD",
"DOWNEY RD",
"DOYLE DR",
"DREW ST",
"DRIFTWOOD DR",
"DRISCOLL DR",
"DROHAN DR",
"DRUMMOND PL",
"DUBLIN ST N",
"DUBLIN ST S",
"DUCK LANE",
"DUFFERIN ST",
"DUKE ST",
"DUMBARTON ST",
"DUNDAS LANE",
"DUNHILL CRES",
"DUNKIRK ST",
"DUNLOP DR",
"DURHAM ST",
"EARL ST",
"EAST RING RD",
"EASTVIEW RD",
"ECHO DR",
"EDGEHILL DR",
"EDINBURGH RD N",
"EDINBURGH RD S",
"EDMONTON DR",
"EDWARDS ST",
"EDWIN ST",
"ELDERBERRY CRT",
"ELEANOR CRT",
"ELGINFIELD DR",
"ELIOT PL",
"ELIZABETH ST",
"ELMHURST CRES",
"ELMIRA RD N",
"ELMIRA RD S",
"ELMRIDGE DR",
"ELORA ST",
"ELSLEY CRT",
"ELSON DR",
"EMMA ST",
"EMPIRE ST",
"EMSLIE ST",
"ERAMOSA RD",
"ERIC CRT",
"ERIE ST",
"ERIN AVE",
"ERVIN CRES",
"ESKER RUN",
"ESSEX ST",
"ETON PL",
"EUGENE DR",
"EVANS DR",
"EVERGREEN DR",
"EXHIBITION ST",
"EXTRA ST",
"FAIR RD",
"FAIRMEADOW DR",
"FAIRVIEW BLVD",
"FAIRWAY LANE",
"FALCON CIR",
"FARLEY DR",
"FARQUHAR ST",
"FERGUS ST",
"FERGUSON ST",
"FERMAN DR",
"FERNBANK PL",
"FERNDALE AVE",
"FIELDSTONE RD",
"FIFE RD",
"FLAHERTY DR",
"FLANDERS RD",
"FLEMING RD",
"FLETCHER CRT",
"FLORAL DR",
"FLORENCE LANE",
"FOBERT CRT",
"FORBES AVE",
"FOREST HILL DR",
"FOREST ST",
"FORSTER DR",
"FOSTER AVE",
"FOUNTAIN ST E",
"FOUNTAIN ST W",
"FOXWOOD CRES",
"FRANCHETTO BLVD",
"FRANKLIN AVE",
"FRASSON DR",
"FREEMAN AVE",
"FRESHFIELD ST",
"FRESHMEADOW WAY",
"FULLER DR",
"GALT ST",
"GARDENVIEW CRT",
"GARIBALDI ST",
"GARTH ST",
"GATEWAY DR",
"GAW CRES",
"GEDDES CRES",
"GEORGE ST",
"GIBBS CRES",
"GINGER CRT",
"GLADSTONE AVE",
"GLASGOW ST N",
"GLASGOW ST S",
"GLEBEHOLME CRES",
"GLENBROOK DR",
"GLENBURNIE DR",
"GLENDA CRT",
"GLENGARRY ST",
"GLENHILL PL",
"GLENHOLME DR",
"GLENWOOD AVE",
"GOLDIE AVE",
"GOLFVIEW RD",
"GOMBAS PL",
"GOODWIN DR",
"GORDON ST",
"GORDON ST",
"GOSLING GDNS",
"GOVENORS RD",
"GOWDY AVE",
"GRAHAM ST",
"GRANDRIDGE CRES",
"GRANGE RD",
"GRANGE ST",
"GRANT ST",
"GREEN ST",
"GREENGATE RD",
"GREENVIEW ST",
"GREENWICH DR",
"GREGORY PL",
"GREY OAK DR",
"GRIERSON DR",
"GRINYER DR",
"GROUSE TRAIL",
"GROVE ST",
"GRYPHON PL",
"GUELPH ST",
"HADATI RD",
"HAGAN AVE",
"HALES CRES",
"HALESMANOR CRT",
"HALL AVE",
"HAMEL AVE",
"HANDS DR",
"HANEY DR",
"HANLON RD",
"HARCOURT DR",
"HARDY ST",
"HARRIS ST",
"HARRISON AVE",
"HARROW CRT",
"HARTS LANE",
"HARTWOOD CRT",
"HARVARD RD",
"HASLER CRES",
"HASTINGS BLVD",
"HAVELOCK ST",
"HAWTHORNE PL",
"HAYES AVE",
"HAYWARD CRES",
"HAZELWOOD DR",
"HEARN AVE",
"HEATH RD",
"HEATHER AVE",
"HEFFERNAN ST",
"HENDERSON DR",
"HENRY CRT",
"HEPBURN AVE",
"HERBERT ST",
"HERITAGE DR",
"HEWITT LANE",
"HICKORY ST",
"HIGHPARK DR",
"HIGHVIEW PL",
"HILL TRAIL",
"HILLCREST DR",
"HILLDALE CRES",
"HILLSDON PL",
"HILLTOP RD",
"HOLLAND CRES",
"HOLLIDAY ST",
"HOLLY CRT",
"HOLLYBERRY PL",
"HOME ST",
"HONEY CRES",
"HONEYSUCKLE DR",
"HOOD ST",
"HOOPER ST",
"HOSKING PL",
"HOWDEN CRES",
"HOWITT ST",
"HUNT ST",
"HUNTERS LANE",
"HUNTINGTON PL",
"HURON ST",
"HYLAND RD",
"IMPERIAL RD N",
"IMPERIAL RD S",
"INDEPENDENCE PL",
"INDUSTRIAL ST",
"INGRAM DR",
"INKERMAN ST",
"INVERNESS DR",
"IRELAND PL",
"IRONWOOD RD",
"IRVING CRES",
"ISLINGTON AVE",
"JACKSON ST",
"JAMES ST E",
"JAMES ST W",
"JANE ST",
"JANEFIELD AVE",
"JEAN ANDERSON CRES",
"JENSEN BLVD",
"JODI PL",
"JOHN ST",
"JOHNSTON ST",
"JOSEPH ST",
"JOYCE PL",
"JULIA DR",
"JUNE AVE",
"KARA LEE CRT",
"KAREN DR",
"KATELYNN DR",
"KATHLEEN ST",
"KEARNEY ST",
"KEATING ST",
"KEATS CRES",
"KELLY CRT",
"KENDRICK AVE",
"KENSINGTON ST",
"KENT ST",
"KENWOOD CRES",
"KERR ST",
"KEYS CRES",
"KILKENNY PL",
"KIMBERLEY DR",
"KING EDWARD PL",
"KING ST",
"KINGSLEY CRT",
"KINGSMILL AVE",
"KINGSWOOD GATE",
"KINLOCK ST",
"KIPLING AVE",
"KIRKBY CRT",
"KIRKLAND ST",
"KIRSTEN DR",
"KITCHENER AVE",
"KNEVITT PL",
"KNIGHTSWOOD BLVD",
"KOCH DR",
"KORTRIGHT RD E",
"KORTRIGHT RD W",
"KRON DR",
"LAIRD RD",
"LAMBERT CRES",
"LANDSDOWN DR",
"LANE ST",
"LANGSIDE ST",
"LATENDA PL",
"LAURELWOOD CRT",
"LAURINE AVE",
"LAVERNE AVE",
"LAW DR",
"LAWRENCE AVE",
"LEACOCK AVE",
"LEADER LANE",
"LEE ST",
"LEMON ST",
"LENNOX LANE",
"LEWIS RD",
"LILAC PL",
"LINCOLN CRES",
"LINDEN PL",
"LINDSAY CRT",
"LISA LANE",
"LIVERPOOL ST",
"LOCKYER RD",
"LOIS LANE",
"LONDON RD E",
"LONDON RD W",
"LONGFELLOW AVE",
"LONSDALE DR",
"LORNA DR",
"LOUISA DR",
"LOWES RD",
"LYLE PL",
"LYNCH CIR",
"LYNWOOD DR",
"LYNWOOD PL",
"LYON AVE",
"MAC AVE",
"MACDONALD ST",
"MACDONELL ST",
"MACKAY ST",
"MAGDALENA DR",
"MAGNOLIA LANE",
"MALCOLM RD",
"MALLARD CRT",
"MALVERN CRES",
"MANHATTAN CRT",
"MANITOBA ST",
"MANOR PARK CRES",
"MAPLE ST",
"MAPLEWOOD DR",
"MARCON ST",
"MARGARET ST",
"MARIGOLD DR",
"MARILYN DR",
"MARKSAM RD",
"MARLBOROUGH RD",
"MARSH CRES",
"MARSLAND CRT",
"MARTIN AVE",
"MARY ST",
"MASON CRT",
"MASSEY RD",
"MATTHEW DR",
"MAYFAIR CRT",
"MAYFIELD AVE",
"MCARTHUR DR",
"MCCALL CRES",
"MCCORKINDALE PL",
"MCCRAE BLVD",
"MCCURDY RD",
"MCELDERRY RD",
"MCGARR CRT",
"MCGARR DR",
"MCGEE ST",
"MCGILVRAY ST",
"MCILWRAITH CRES",
"MCINTOSH LANE",
"MCLACHLAN PL",
"MCNULTY LANE",
"MCTAGUE ST",
"MCWILLIAMS RD",
"MEADOW CRES",
"MEADOWVIEW AVE",
"MEGAN PL",
"MELROSE PL",
"MEMORIAL CRES",
"MENZIE AVE",
"MERCER ST",
"MERGANSER DR",
"MERION ST",
"MERRITT BLVD",
"METCALFE ST",
"MEYER DR",
"MICHAEL PL",
"MICHENER RD",
"MILLER ST",
"MILLWOOD CRT",
"MILSON CRES",
"MINTO RD",
"MITCHELL ST",
"MOFFATT LANE",
"MOHAWK DR",
"MOLLISON CRT",
"MONARCH RD",
"MONT ST",
"MONTANA RD",
"MONTGOMERY ST",
"MONTICELLO CRES",
"MONTREAL RD",
"MOORE AVE",
"MORRIS ST",
"MOSS PL",
"MOUNTFORD DR",
"MULBERRY CRT",
"MULLEN DR",
"MUNICIPAL ST",
"MUNROE CRES",
"MURPHY CRT",
"MUSKOKA DR",
"MUTUAL ST",
"NEEVE ST",
"NELSON RD",
"NEW ST",
"NEWSTEAD ST",
"NICKLIN CRES",
"NICKLIN RD",
"NISKA RD",
"NORFOLK ST",
"NORMA CRES",
"NORMANDY DR",
"NORTH ST",
"NORTHUMBERLAND ST",
"NORTHWOOD CRES",
"NORTON DR",
"NORWICH ST E",
"NORWICH ST W",
"NOTTINGHAM ST",
"OAK ST",
"OAKRIDGE CRES",
"OAKWOOD AVE",
"OCONNOR LANE",
"OLD COLONY TRAIL",
"OLD STONE CRT",
"OLIVER ST",
"OMAR ST",
"ONTARIO ST",
"ORCHARD CRES",
"ORIOLE CRES",
"OTTAWA CRES",
"OXFORD ST",
"PACIFIC PL",
"PAISLEY RD",
"PAISLEY SERVICE RD",
"PAISLEY ST",
"PALERMO CRES",
"PALMER ST",
"PAMELA PL",
"PARK AVE",
"PARKER PL",
"PARKHOLM AVE",
"PARKSIDE DR",
"PARKVIEW CRES",
"PARKWOOD RD",
"PAUL AVE",
"PAULINE PL",
"PAULSTOWN CRES",
"PEACHTREE CRES",
"PEARL ST",
"PEARTREE CRES",
"PEER DR",
"PENFOLD DR",
"PENNI PL",
"PERIWINKLE WAY",
"PETER AVE",
"PETITT DR",
"PETROLIA ST",
"PETTITT DR",
"PHEASANT RUN DR",
"PHELAN DR",
"PHILIP AVE",
"PICADILLY PL",
"PICKWICK PL",
"PILLET PL",
"PINE DR",
"PINE RIDGE DR",
"PINETREE DR",
"PINNACLE CRES",
"PINTAIL CRT",
"PIONEER TRAIL",
"PIPE ST",
"PLEASANT RD",
"PLYMOUTH CRT",
"PONDVIEW CRES",
"POPHAM DR",
"POPPY LANE",
"PORTER CRT",
"PORTER DR",
"POWELL ST E",
"POWELL ST W",
"POWERHOUSE LANE",
"PRESTON ST",
"PRICE ST",
"PRIMROSE LANE",
"PRINCESS ST",
"PRINCETON PL",
"PRIORY ST",
"PROSPECT AVE",
"PTARMIGAN DR",
"QUAIL CREEK DR",
"QUAISER CRT",
"QUEBEC ST",
"QUEEN ST",
"QUEENSDALE CRES",
"RAGLAN ST",
"RALSTON DR",
"RAMONA PL",
"RASPBERRY LANE",
"RASPBERRY RD",
"RAY CRES",
"RAYMOND ST",
"REGAL RD",
"REGENT ST",
"REID CRT",
"RENFIELD ST",
"RENFREW PL",
"RESEARCH LANE",
"REVELL DR",
"RHONDA RD",
"RICHARDSON ST",
"RICKSON AVE",
"RIDGEWAY AVE",
"RIDGEWOOD AVE",
"RIVERVIEW DR",
"ROBERTSON DR",
"ROBIN RD",
"ROBINSON AVE",
"ROCHELLE DR",
"RODGERS RD",
"RODNEY BLVD",
"ROEHAMPTON CRES",
"ROLAND ST",
"ROSE ST",
"ROSEDALE AVE",
"ROSEWOOD AVE",
"ROYAL RD",
"RUTHERFORD CRT",
"RYAN AVE",
"RYDE RD",
"SACKVILLE ST",
"SAGEWOOD PL",
"SANDCREEK LANE",
"SANDERSON DR",
"SANDPIPER DR",
"SCHIEDEL DR",
"SCHRODER CRES",
"SCHUURMAN CRT",
"SCOTT CRT",
"SCOTTSDALE DR",
"SERENA LANE",
"SEVERN DR",
"SHACKLETON DR",
"SHADYBROOK CRES",
"SHAFTESBURY AVE",
"SHAKESPEARE DR",
"SHALLMAR CRT",
"SHARON PL",
"SHEEHY CRT",
"SHELBY PL",
"SHELLDALE CRES",
"SHERIDAN ST",
"SHERWOOD DR",
"SHIRLEY AVE",
"SHOEMAKER CRES",
"SHORT ST",
"SIDNEY CRES",
"SILURIAN DR",
"SILVERCREEK PKY N",
"SILVERCREEK PKY S",
"SILVERSMITH CRT",
"SIMCOE ST",
"SIMMONDS DR",
"SIMPSON WAY",
"SINCLAIR ST",
"SKOV CRES",
"SKYE PL",
"SLEEMAN AVE",
"SLOAN AVE",
"SMART ST",
"SMITH AVE",
"SMITH LANE",
"SOMERSET GLEN",
"SOUTH RING RD",
"SOUTHAMPTON ST",
"SOUTHCREEK TRAIL",
"SOUTHGATE DR",
"SPARLING CRT",
"SPEEDVALE AVE E",
"SPEEDVALE AVE W",
"SPENCER CRT",
"SPRING ST",
"SPRINGDALE BLVD",
"SPRUCE PL",
"SPRUCEHAVEN CRT",
"ST ANDREW ST",
"ST ARNAUD ST",
"ST CATHERINE ST",
"STANLEY ST",
"STARVIEW CRES",
"STARWOOD DR",
"STEFFLER DR",
"STEPHANIE DR",
"STEPHEN DR",
"STEVENSON ST N",
"STEVENSON ST S",
"STIRLING PL",
"STONE RD E",
"STONE RD W",
"STRATHMERE PL",
"STUART ST",
"STULL AVE",
"SUBURBAN AVE",
"SUFFOLK ST E",
"SUFFOLK ST W",
"SUGARBUSH PL",
"SULLIVAN CRES",
"SULTAN ST",
"SUMAC PL",
"SUMMERFIELD DR",
"SUMMIT CRES",
"SUMMIT RIDGE RD",
"SUNNYLEA CRES",
"SUNRISE CRT",
"SUNSET RD",
"SURREY ST E",
"SURREY ST W",
"SUZANNA DR",
"SWEENEY DR",
"SWIFT CRES",
"SYDENHAM ST",
"TAGGART ST",
"TALBOT ST",
"TAMARACK PL",
"TANAGER DR",
"TANNER ST",
"TEAKWOOD PL",
"TEAL DR",
"TERRACE LANE",
"TERRAVIEW CRES",
"TERRY BLVD",
"THISTLE RD",
"THOMASFIELD DR",
"THOMPSON DR",
"THORNBERRY CRT",
"THORNHILL DR",
"THORNTON ST",
"TIFFANY ST E",
"TIFFANY ST W",
"TIPPERARY PL",
"TOBEY AVE",
"TOLTON DR",
"TORCH LANE",
"TORONTO ST",
"TORRANCE CRES",
"TOVELL DR",
"TRAILBROOK LANE",
"TRAYMORE DR",
"TRENDELL LANE",
"TRENT LANE",
"TRILLIUM CRT",
"TROY CRES",
"TRUESDALE CRES",
"UNIVERSITY AVE E",
"UNIVERSITY AVE W",
"UPLANDS PL",
"UPTON CRES",
"VALERIOTE PL",
"VALLEY RD",
"VALLEYHAVEN LANE",
"VALLEYRIDGE TRAIL",
"VALLEYVIEW DR",
"VANCOUVER DR",
"VANIER DR",
"VARDON DR",
"VAUGHAN ST",
"VERMONT ST",
"VERNEY ST",
"VICTORIA RD N",
"VICTORIA RD S",
"VILLAGE CROSSING E",
"VILLAGE CROSSING W",
"VILLAGE GREEN DR",
"VISTA TERR",
"WAGONERS TRAIL",
"WALKER WAY",
"WALMAN DR",
"WALNUT DR",
"WALTER ST",
"WARREN ST",
"WASHBURN DR",
"WATER ST",
"WATERLOO AVE",
"WATERWORKS PL",
"WATSON LANE",
"WATSON PKY N",
"WATSON PKY S",
"WATSON RD N",
"WATSON RD S",
"WATT ST",
"WAVERLEY DR",
"WAXWING CRES",
"WEIR DR",
"WELLINGTON ST E",
"WELLINGTON ST W",
"WELLS ST",
"WEST ACRES DR",
"WESTERN AVE",
"WESTGATE DR",
"WESTHILL RD",
"WESTMINSTER AVE",
"WESTMOUNT RD",
"WESTOBY PL",
"WESTRA DR",
"WESTWIND CIR",
"WESTWOOD RD",
"WHEELER AVE",
"WHETSTONE CRES",
"WHISPERING RIDGE DR",
"WHITE PINE WAY",
"WHITE ST",
"WHITELAW RD",
"WHITETAIL CRT",
"WHITTAKER CRT",
"WILBERT ST",
"WILD ROSE CRT",
"WILDWOOD PL",
"WILFRID LAURIER CRT",
"WILKIE CRES",
"WILLIAM ST",
"WILLOW RD",
"WILSON ST",
"WILSONVIEW AVE",
"WILTON RD",
"WILTSHIRE PL",
"WIMBLEDON RD",
"WINDERMERE CRT",
"WINDSOR ST",
"WINSTON CRES",
"WINTERBERRY LANE",
"WOLFOND CRES",
"WOLSELEY RD",
"WOOD DUCK CRT",
"WOOD ST",
"WOODBOROUGH RD",
"WOODLAND GLEN DR",
"WOODLAWN RD E",
"WOODLAWN RD W",
"WOODRIDGE DR",
"WOODSIDE RD",
"WOODYCREST DR",
"WOOLWICH ST",
"WORTON AVE",
"WYNDHAM ST N",
"WYNDHAM ST S",
"YARMOUTH ST",
"YEADON DR",
"YEATS CRT",
"YEWHOLME DR",
"YORK RD",
"YORK RD",
"YORKSHIRE ST N",
"YORKSHIRE ST S",
"YOUNG ST",
"YOUNGMAN DR",
"ZADUK PL",
"ZECCA DR",
"ZESS CRT"];

$(function() {

    $( "#streetNameID" ).autocomplete({
        source: availableTags
    });

    $("form").submit(function() {
		$("form").find(".myError").detach();

        streetName = $(this).find("#streetNameID").val().toUpperCase();
        streetNum = $(this).find("#streetNumID").val();
		
		if((errorMsg = validateInfo(streetNum, streetName)) != "") {
			$("form").append("<div class='myError error'>" + errorMsg + "</div>");
			return false;
		} else {
			setCookie("streetName", streetName, 1);
			setCookie("streetNum", streetNum, 1);
			document.location.href = "/dashboard";
		}
        return false;
    });
});

function validateInfo(curStreetNum, curStreetName) {	
	if(!curStreetNum.match(/^\d+$/) || parseInt(curStreetNum) <= 0) {
		return "Error parsing input, only numbers greater than 0 are allowed for the street number";
	} else 
	
	if(!curStreetName.match(/^[A-Z ]+$/)) {
		return "Error parsing input, only the letters A-Z and spaces are allowed for the street name";
	}	
	for(curTag in availableTags) {
		if(availableTags.hasOwnProperty(curTag) && availableTags[curTag].indexOf(curStreetName) !== -1) {
			streetName = availableTags[curTag];
		}
	}
	
	return "";
}