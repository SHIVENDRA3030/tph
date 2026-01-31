/**
 * Optimal Route Service
 * Implements A* pathfinding with multi-criteria optimization
 * Factors: Distance, Traffic, Safety (accident history), Time
 */

const { sequelize } = require('../config/database');
const { EmergencyService, AccidentHistory } = require('../models');
const turf = require('@turf/turf');

// Priority Queue implementation for A*
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(item, priority) {
    this.items.push({ item, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.items.shift()?.item;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

// Graph Node representing a waypoint
class GraphNode {
  constructor(id, lat, lng, type = 'intersection') {
    this.id = id;
    this.lat = lat;
    this.lng = lng;
    this.type = type;
    this.connections = []; // Array of {node, distance, trafficLevel, accidentRisk}
  }
}

// Route Service
class RoutingService {
  constructor() {
    this.graphCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Calculate the optimal route considering multiple factors
   * @param {Object} start - {lat, lng}
   * @param {Object} end - {lat, lng}
   * @param {Object} preferences - { prioritizeSafety, avoidTraffic, maxDistance }
   * @returns {Object} - GeoJSON route with metadata
   */
  async calculateOptimalRoute(start, end, preferences = {}) {
    const {
      prioritizeSafety = true,
      avoidTraffic = true,
      maxDistance = null,
      emergencyType = 'general'
    } = preferences;

    try {
      // Step 1: Build or retrieve graph for the area
      const graph = await this.buildRouteGraph(start, end);

      // Step 2: Find nearest nodes to start and end
      const startNode = this.findNearestNode(graph, start);
      const endNode = this.findNearestNode(graph, end);

      if (!startNode || !endNode) {
        throw new Error('Could not find valid route endpoints');
      }

      // Step 3: Run A* algorithm with custom heuristic
      const route = this.aStarPathfinding(startNode, endNode, {
        prioritizeSafety,
        avoidTraffic,
        maxDistance,
        emergencyType
      });

      if (!route) {
        throw new Error('No valid route found');
      }

      // Step 4: Generate turn-by-turn instructions
      const instructions = this.generateInstructions(route);

      // Step 5: Calculate route metadata
      const metadata = this.calculateRouteMetadata(route);

      return {
        success: true,
        route: this.convertToGeoJSON(route),
        instructions,
        metadata
      };

    } catch (error) {
      console.error('Route calculation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build a graph representation of the road network
   * In production, this would use actual road network data (OSM, etc.)
   */
  async buildRouteGraph(start, end) {
    const cacheKey = `${start.lat},${start.lng}-${end.lat},${end.lng}`;
    
    if (this.graphCache.has(cacheKey)) {
      const cached = this.graphCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.graph;
      }
    }

    // Generate a grid-based graph for the area between start and end
    const bounds = this.calculateBounds(start, end, 0.02); // 2km buffer
    const graph = this.generateGridGraph(bounds, 0.005); // 500m grid size

    // Enrich graph with accident data
    await this.enrichWithAccidentData(graph);

    // Cache the graph
    this.graphCache.set(cacheKey, {
      graph,
      timestamp: Date.now()
    });

    return graph;
  }

  /**
   * Generate a grid-based graph for pathfinding
   */
  generateGridGraph(bounds, gridSize) {
    const nodes = new Map();
    let nodeId = 0;

    // Generate grid nodes
    for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += gridSize) {
      for (let lng = bounds.minLng; lng <= bounds.maxLng; lng += gridSize) {
        const id = `node_${nodeId++}`;
        nodes.set(id, new GraphNode(id, lat, lng));
      }
    }

    // Connect adjacent nodes
    const nodeArray = Array.from(nodes.values());
    
    for (const node of nodeArray) {
      const neighbors = this.findNeighbors(node, nodeArray, gridSize);
      
      for (const neighbor of neighbors) {
        const distance = this.haversineDistance(
          node.lat, node.lng,
          neighbor.lat, neighbor.lng
        );

        node.connections.push({
          node: neighbor,
          distance,
          trafficLevel: Math.random() * 0.5, // Mock traffic (0-1)
          accidentRisk: 0.1 // Base accident risk
        });
      }
    }

    return nodeArray;
  }

  /**
   * Find neighboring nodes within grid distance
   */
  findNeighbors(node, allNodes, gridSize) {
    const neighbors = [];
    const maxDistance = gridSize * 1.5;

    for (const other of allNodes) {
      if (other.id === node.id) continue;
      
      const dist = this.haversineDistance(
        node.lat, node.lng,
        other.lat, other.lng
      );

      if (dist <= maxDistance) {
        neighbors.push(other);
      }
    }

    return neighbors;
  }

  /**
   * Enrich graph nodes with accident history data
   */
  async enrichWithAccidentData(graph) {
    try {
      // Get all nodes' locations
      const nodePoints = graph.map(node => ({
        node,
        point: turf.point([node.lng, node.lat])
      }));

      // Query accident history within the area
      const accidents = await AccidentHistory.findAll({
        where: sequelize.where(
          sequelize.fn('ST_DWithin',
            sequelize.col('location'),
            sequelize.fn('ST_SetSRID',
              sequelize.fn('ST_MakePoint',
                nodePoints[0]?.node.lng || 0,
                nodePoints[0]?.node.lat || 0
              ),
              4326
            ),
            5000 // 5km radius
          ),
          true
        )
      });

      // Calculate accident risk for each edge
      for (const node of graph) {
        for (const connection of node.connections) {
          const edgeCenter = {
            lat: (node.lat + connection.node.lat) / 2,
            lng: (node.lng + connection.node.lng) / 2
          };

          // Count accidents near this edge
          let nearbyAccidents = 0;
          let totalSeverity = 0;

          for (const accident of accidents) {
            const accidentLoc = turf.point([
              accident.location.coordinates[0],
              accident.location.coordinates[1]
            ]);
            const edgePoint = turf.point([edgeCenter.lng, edgeCenter.lat]);
            const distance = turf.distance(edgePoint, accidentLoc, { units: 'meters' });

            if (distance < 200) { // Within 200m
              nearbyAccidents++;
              totalSeverity += accident.severity || 5;
            }
          }

          // Calculate risk score (0-1)
          if (nearbyAccidents > 0) {
            const avgSeverity = totalSeverity / nearbyAccidents;
            connection.accidentRisk = Math.min(1, (nearbyAccidents * avgSeverity) / 50);
          }
        }
      }
    } catch (error) {
      console.error('Error enriching with accident data:', error);
    }
  }

  /**
   * A* Pathfinding Algorithm with multi-criteria optimization
   */
  aStarPathfinding(startNode, endNode, options) {
    const { prioritizeSafety, avoidTraffic, maxDistance, emergencyType } = options;

    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(startNode.id, 0);
    fScore.set(startNode.id, this.heuristic(startNode, endNode));
    openSet.enqueue(startNode, fScore.get(startNode.id));

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue();

      if (current.id === endNode.id) {
        return this.reconstructPath(cameFrom, current);
      }

      closedSet.add(current.id);

      for (const connection of current.connections) {
        const neighbor = connection.node;

        if (closedSet.has(neighbor.id)) continue;

        // Calculate edge weight based on multiple factors
        const edgeWeight = this.calculateEdgeWeight(connection, {
          prioritizeSafety,
          avoidTraffic,
          emergencyType
        });

        const tentativeGScore = (gScore.get(current.id) || Infinity) + edgeWeight;

        if (tentativeGScore < (gScore.get(neighbor.id) || Infinity)) {
          cameFrom.set(neighbor.id, { node: current, connection });
          gScore.set(neighbor.id, tentativeGScore);
          fScore.set(neighbor.id, tentativeGScore + this.heuristic(neighbor, endNode));

          openSet.enqueue(neighbor, fScore.get(neighbor.id));
        }
      }
    }

    return null; // No path found
  }

  /**
   * Calculate edge weight combining multiple factors
   */
  calculateEdgeWeight(connection, options) {
    const { prioritizeSafety, avoidTraffic, emergencyType } = options;

    // Base weight is distance (in km)
    let weight = connection.distance;

    // Traffic factor (1x to 3x multiplier)
    if (avoidTraffic) {
      const trafficMultiplier = 1 + (connection.trafficLevel * 2);
      weight *= trafficMultiplier;
    }

    // Safety factor (accident risk increases weight)
    if (prioritizeSafety) {
      const safetyMultiplier = 1 + (connection.accidentRisk * 3);
      weight *= safetyMultiplier;
    }

    // Emergency type adjustments
    if (emergencyType === 'fire') {
      // Prefer wider roads (lower accident risk usually)
      weight *= (1 + connection.accidentRisk);
    }

    return weight;
  }

  /**
   * Heuristic function for A* (Euclidean distance)
   */
  heuristic(nodeA, nodeB) {
    return this.haversineDistance(
      nodeA.lat, nodeA.lng,
      nodeB.lat, nodeB.lng
    );
  }

  /**
   * Reconstruct path from cameFrom map
   */
  reconstructPath(cameFrom, current) {
    const path = [current];
    const connections = [];

    while (cameFrom.has(current.id)) {
      const { node, connection } = cameFrom.get(current.id);
      connections.unshift(connection);
      path.unshift(node);
      current = node;
    }

    return { nodes: path, connections };
  }

  /**
   * Find nearest service by type
   */
  async findNearestService(location, serviceType, limit = 5) {
    try {
      const services = await EmergencyService.findAll({
        where: {
          type: serviceType,
          isActive: true
        },
        order: sequelize.literal(`ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)::geography
        )`),
        limit
      });

      return services.map(service => {
        const serviceLoc = service.location.coordinates;
        const distance = this.haversineDistance(
          location.lat, location.lng,
          serviceLoc[1], serviceLoc[0]
        );

        return {
          ...service.toJSON(),
          distanceKm: Math.round(distance * 100) / 100,
          estimatedTimeMin: Math.round(distance * 2) // Rough estimate: 30km/h avg
        };
      });
    } catch (error) {
      console.error('Error finding nearest service:', error);
      return [];
    }
  }

  /**
   * Generate turn-by-turn instructions
   */
  generateInstructions(route) {
    const instructions = [];
    const { nodes, connections } = route;

    if (nodes.length < 2) return instructions;

    // Starting instruction
    instructions.push({
      step: 1,
      action: 'start',
      text: `Head towards ${nodes[1].lat.toFixed(4)}, ${nodes[1].lng.toFixed(4)}`,
      distance: connections[0]?.distance || 0
    });

    // Intermediate instructions
    for (let i = 1; i < nodes.length - 1; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      const next = nodes[i + 1];

      const bearing1 = this.calculateBearing(prev.lat, prev.lng, curr.lat, curr.lng);
      const bearing2 = this.calculateBearing(curr.lat, curr.lng, next.lat, next.lng);
      const turnAngle = this.normalizeAngle(bearing2 - bearing1);

      let action = 'straight';
      let text = 'Continue straight';

      if (turnAngle > 30 && turnAngle < 150) {
        action = 'turn_right';
        text = 'Turn right';
      } else if (turnAngle < -30 && turnAngle > -150) {
        action = 'turn_left';
        text = 'Turn left';
      } else if (Math.abs(turnAngle) >= 150) {
        action = 'u_turn';
        text = 'Make a U-turn';
      }

      instructions.push({
        step: i + 1,
        action,
        text,
        distance: connections[i]?.distance || 0,
        coordinates: { lat: curr.lat, lng: curr.lng }
      });
    }

    // Final instruction
    instructions.push({
      step: instructions.length + 1,
      action: 'arrive',
      text: 'You have arrived at your destination',
      distance: 0
    });

    return instructions;
  }

  /**
   * Calculate route metadata
   */
  calculateRouteMetadata(route) {
    const { nodes, connections } = route;
    
    let totalDistance = 0;
    let totalTime = 0;
    let avgTraffic = 0;
    let maxAccidentRisk = 0;

    for (const conn of connections) {
      totalDistance += conn.distance;
      
      // Estimate time based on distance and traffic
      const speedKmh = 30 * (1 - conn.trafficLevel * 0.5); // 30km/h base, reduced by traffic
      totalTime += (conn.distance / speedKmh) * 60; // Convert to minutes
      
      avgTraffic += conn.trafficLevel;
      maxAccidentRisk = Math.max(maxAccidentRisk, conn.accidentRisk);
    }

    avgTraffic = connections.length > 0 ? avgTraffic / connections.length : 0;

    // Calculate safety score (0-100, higher is safer)
    const safetyScore = Math.round((1 - maxAccidentRisk) * 100);

    return {
      totalDistanceKm: Math.round(totalDistance * 100) / 100,
      estimatedTimeMin: Math.round(totalTime),
      waypoints: nodes.length,
      avgTrafficLevel: Math.round(avgTraffic * 100) / 100,
      maxAccidentRisk: Math.round(maxAccidentRisk * 100) / 100,
      safetyScore,
      criteria: {
        shortestPath: true,
        lowTraffic: avgTraffic < 0.3,
        safePassage: safetyScore > 70,
        minimalTime: totalTime < 30
      }
    };
  }

  /**
   * Convert route to GeoJSON format
   */
  convertToGeoJSON(route) {
    const coordinates = route.nodes.map(node => [node.lng, node.lat]);

    return {
      type: 'Feature',
      properties: {
        name: 'Optimal Emergency Route',
        description: 'Route optimized for safety, traffic, and time'
      },
      geometry: {
        type: 'LineString',
        coordinates
      }
    };
  }

  /**
   * Find nearest node in graph
   */
  findNearestNode(graph, point) {
    let nearest = null;
    let minDist = Infinity;

    for (const node of graph) {
      const dist = this.haversineDistance(
        point.lat, point.lng,
        node.lat, node.lng
      );

      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    }

    return nearest;
  }

  /**
   * Calculate bounds with buffer
   */
  calculateBounds(start, end, buffer) {
    const minLat = Math.min(start.lat, end.lat) - buffer;
    const maxLat = Math.max(start.lat, end.lat) + buffer;
    const minLng = Math.min(start.lng, end.lng) - buffer;
    const maxLng = Math.max(start.lng, end.lng) + buffer;

    return { minLat, maxLat, minLng, maxLng };
  }

  /**
   * Haversine distance calculation
   */
  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate bearing between two points
   */
  calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = this.toRadians(lng2 - lng1);
    const lat1Rad = this.toRadians(lat1);
    const lat2Rad = this.toRadians(lat2);

    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

    return this.toDegrees(Math.atan2(y, x));
  }

  /**
   * Normalize angle to -180 to 180
   */
  normalizeAngle(angle) {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  }

  toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  toDegrees(radians) {
    return radians * 180 / Math.PI;
  }
}

module.exports = new RoutingService();
