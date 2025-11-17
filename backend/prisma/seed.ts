import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const senhaHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@vendasmax.com.br' },
    update: {},
    create: {
      email: 'admin@vendasmax.com.br',
      senha: senhaHash,
      nome: 'Administrador',
      role: 'ADMIN',
    },
  });
  console.log('✅ Usuário admin criado:', admin.email);

  // Criar categorias
  const categorias = await Promise.all([
    prisma.categoria.upsert({
      where: { nome: 'Bebidas' },
      update: {},
      create: { nome: 'Bebidas', descricao: 'Bebidas em geral' },
    }),
    prisma.categoria.upsert({
      where: { nome: 'Alimentos' },
      update: {},
      create: { nome: 'Alimentos', descricao: 'Alimentos diversos' },
    }),
    prisma.categoria.upsert({
      where: { nome: 'Material de Limpeza' },
      update: {},
      create: { nome: 'Material de Limpeza', descricao: 'Produtos de limpeza' },
    }),
    prisma.categoria.upsert({
      where: { nome: 'Higiene Pessoal' },
      update: {},
      create: { nome: 'Higiene Pessoal', descricao: 'Produtos de higiene' },
    }),
  ]);
  console.log('✅ Categorias criadas:', categorias.length);

  // Criar condomínio de exemplo
  const senhaCondo = await bcrypt.hash('condo123', 10);
  const condominio = await prisma.condominio.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      cnpj: '12.345.678/0001-90',
      nome: 'Condomínio Exemplo',
      rua: 'Rua das Flores, 123',
      cep: '01234-567',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      totalBlocos: 3,
      totalApartamentos: 60,
      usuario: 'condominio_exemplo',
      senha: senhaCondo,
    },
  });
  console.log('✅ Condomínio criado:', condominio.nome);

  // Criar containers
  const containers = await Promise.all([
    prisma.container.create({
      data: {
        condominioId: condominio.id,
        bloco: 'A',
        espaco: 'Térreo',
        localizacao: 'Bloco A - Térreo - Próximo ao elevador',
      },
    }),
    prisma.container.create({
      data: {
        condominioId: condominio.id,
        bloco: 'B',
        espaco: 'Térreo',
        localizacao: 'Bloco B - Térreo - Hall de entrada',
      },
    }),
  ]);
  console.log('✅ Containers criados:', containers.length);

  // Criar produtos
  const produtos = [
    {
      nome: 'Água Mineral 500ml',
      categoriaId: categorias[0].id,
      descricao: 'Água mineral sem gás',
      codigoBarras: '7891234567890',
      valorCompra: 1.5,
      valorVenda: 2.5,
      estoqueMinimo: 50,
    },
    {
      nome: 'Refrigerante Cola 350ml',
      categoriaId: categorias[0].id,
      descricao: 'Refrigerante sabor cola',
      codigoBarras: '7891234567891',
      valorCompra: 2.0,
      valorVenda: 3.5,
      estoqueMinimo: 40,
    },
    {
      nome: 'Suco Natural Laranja 300ml',
      categoriaId: categorias[0].id,
      descricao: 'Suco natural de laranja',
      codigoBarras: '7891234567892',
      valorCompra: 3.5,
      valorVenda: 5.5,
      estoqueMinimo: 30,
    },
    {
      nome: 'Chocolate ao Leite 90g',
      categoriaId: categorias[1].id,
      descricao: 'Chocolate ao leite',
      codigoBarras: '7891234567893',
      valorCompra: 3.0,
      valorVenda: 5.0,
      estoqueMinimo: 25,
    },
    {
      nome: 'Biscoito Recheado 140g',
      categoriaId: categorias[1].id,
      descricao: 'Biscoito recheado chocolate',
      codigoBarras: '7891234567894',
      valorCompra: 2.5,
      valorVenda: 4.0,
      estoqueMinimo: 30,
    },
    {
      nome: 'Salgadinho 150g',
      categoriaId: categorias[1].id,
      descricao: 'Salgadinho sabor queijo',
      codigoBarras: '7891234567895',
      valorCompra: 4.0,
      valorVenda: 6.5,
      estoqueMinimo: 20,
    },
    {
      nome: 'Detergente 500ml',
      categoriaId: categorias[2].id,
      descricao: 'Detergente líquido',
      codigoBarras: '7891234567896',
      valorCompra: 1.8,
      valorVenda: 3.0,
      estoqueMinimo: 15,
    },
    {
      nome: 'Sabão em Pó 1kg',
      categoriaId: categorias[2].id,
      descricao: 'Sabão em pó para roupas',
      codigoBarras: '7891234567897',
      valorCompra: 8.0,
      valorVenda: 12.0,
      estoqueMinimo: 10,
    },
    {
      nome: 'Sabonete 90g',
      categoriaId: categorias[3].id,
      descricao: 'Sabonete em barra',
      codigoBarras: '7891234567898',
      valorCompra: 1.5,
      valorVenda: 2.5,
      estoqueMinimo: 30,
    },
    {
      nome: 'Pasta de Dente 90g',
      categoriaId: categorias[3].id,
      descricao: 'Creme dental',
      codigoBarras: '7891234567899',
      valorCompra: 3.5,
      valorVenda: 5.5,
      estoqueMinimo: 20,
    },
  ];

  for (const produtoData of produtos) {
    const produto = await prisma.produto.create({
      data: produtoData,
    });

    // Criar estoque geral
    await prisma.estoqueGeral.create({
      data: {
        produtoId: produto.id,
        quantidade: 200,
      },
    });

    // Distribuir estoque entre containers
    for (const container of containers) {
      await prisma.containerEstoque.create({
        data: {
          containerId: container.id,
          produtoId: produto.id,
          quantidade: 100,
          dataValidade: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
        },
      });
    }
  }
  console.log('✅ Produtos criados:', produtos.length);
  console.log('✅ Estoque distribuído entre containers');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Credenciais de acesso:');
  console.log('   Admin: admin@vendasmax.com.br / admin123');
  console.log('   Condomínio: condominio_exemplo / condo123');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
