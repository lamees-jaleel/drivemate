import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma.js';

async function test() {
  const user = await prisma.user.findFirst();
  if(!user) {
    console.log('No user found');
    return;
  }
  
  console.log('User Email:', user.email);
  
  const rawPass = 'Secret123!';
  const hash = await bcrypt.hash(rawPass, 12);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash }
  });
  
  const updated = await prisma.user.findFirst();
  const match = await bcrypt.compare(rawPass, updated!.passwordHash);
  
  console.log('Updated Hash Match:', match);
}

test().catch(console.error).finally(() => prisma.$disconnect());
