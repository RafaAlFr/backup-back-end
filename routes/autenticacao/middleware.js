const jwt = require('jsonwebtoken');
const { Token, UserProfile, Cargo } = require('../../model/db');

const authMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      const tokenDoc = await Token.findOne({ where: { token, idUserProfiles: req.user.id } });
      console.log(req.user.id)
      if (!tokenDoc || new Date() > tokenDoc.expiresAt) {
        return res.status(401).json({ message: 'Access denied. Token expired or invalid.' });
      }

      // Buscar as roles do usuário
      const user = await UserProfile.findByPk(req.user.id, {
        include: [{
          model: Cargo,
          attributes: ['cargo']
        }]
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // se tirar o s de Cargos, TUDO MORRE
      const userRoles = user.Cargos.map(cargo => cargo.cargo);

      // Verifica se o usuário tem pelo menos uma das roles permitidas
      const hasAccess = allowedRoles.some(cargo => userRoles.includes(cargo));

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied. Insufficient privileges.' });
      }

      next();
    } catch (ex) {
      res.status(400).json({ message: 'Invalid token.' });
    }
  };
};

module.exports = authMiddleware;
