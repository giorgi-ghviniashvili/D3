/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getPoints(){
    //Holds all Northern points
    var nPoints = new Array();

    //Holds all Southern points
    var sPoints = new Array();

    //Simulate the red points in the north array
    for (var i = 0; i < 250; i++) {
        a = Math.random() * 90;
        b = Math.random() * 180;
        nPoints.push({
        id: "nPointRed" + i,
        Latitude: a,
        Longitude: i % 2 == 0 ? -b : b,
        Class: "red",
        City: "New York"
        });
    }

    //Simulate the blue points in the north array
    for (var i = 0; i < 250; i++) {
        a = Math.random() * 90;
        b = Math.random() * 180;
        nPoints.push({
        id: "nPointBlue" + i,
        Latitude: a,
        Longitude: i % 2 == 0 ? -b: b,
        Class: "blue",
        City: "New York"
        });
    }

        //Simulate the red points in the south array
    for (var i = 0; i < 250; i++) {
        a = Math.random() * 90;
        b = Math.random() * 180;
        sPoints.push({
        id: "sPointRed" + i,
        Latitude: -a,
        Longitude: i % 2 == 0 ? -b : b,
        Class: "red",
        City: "New York"
        });
    }

    //Simulate the blue points in the south array
    for (var i = 0; i < 250; i++) {
        a = Math.random() * 90;
        b = Math.random() * 180;
        sPoints.push({
        id: "sPointBlue" + i,
        Latitude: -a,
        Longitude: i % 2 == 0 ? -b : b,
        Class: "blue",
        City: "New York"
        });
    }
    return [shuffle(nPoints), shuffle(sPoints)];
}
