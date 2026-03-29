const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpieza y creación de perfil de administrador en JS...');

  // 1. Crear Usuario Administrador (Idempotente)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const agentPassword = await bcrypt.hash('agente123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@prestamopro.com' },
    update: {},
    create: {
      email: 'admin@prestamopro.com',
      password: adminPassword,
      name: 'Administrador Pro',
      role: 'ADMIN',
    },
  });

  // 2. Crear Usuario Agente de Cobros vinculado al Administrador anterior
  await prisma.user.upsert({
    where: { email: 'agente@prestamopro.com' },
    update: {
        adminId: admin.id
    },
    create: {
      email: 'agente@prestamopro.com',
      password: agentPassword,
      name: 'Agente Juan',
      role: 'AGENT',
      adminId: admin.id
    },
  });

  console.log('Seed completado: Usuario Administrador y Agente vinculado creados con éxito.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
