function calcGravity(timeStep, body1, body2, SCALE) {
    let planet = {
        x: body2.x / SCALE,
        y: body2.y / SCALE,
        mass: body2.mass / SCALE
    };
    let player = {
        x: body1.x / SCALE,
        y: body1.y / SCALE,
        mass: body2.mass / SCALE
    };
    var distance = Math.sqrt(
        (player.x - planet.x) * (player.x - planet.x) +
        (player.y - planet.y) * (player.y - planet.y));
    var G = 0.0015;

    var strength = G * (planet.mass * player.mass) / (Math.pow(distance, 2.5));

    var force = {
        x: planet.x - player.x,
        y: planet.y - player.y
    };
    force.x /= distance;
    force.y /= distance;
    force.x *= strength;
    force.y *= strength;
    force.x *= timeStep;
    force.y *= timeStep;

    return force;
}

exports.calcGravity = calcGravity;
