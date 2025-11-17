import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const relatorioVendas = async (req: Request, res: Response) => {
  try {
    const { dataInicio, dataFim, containerId, periodo = 'mensal' } = req.query;

    if (!dataInicio || !dataFim) {
      throw new AppError('Data de início e fim são obrigatórias', 400);
    }

    const where: any = {
      createdAt: {
        gte: new Date(String(dataInicio)),
        lte: new Date(String(dataFim)),
      },
    };

    if (containerId) {
      where.containerId = String(containerId);
    }

    const vendas = await prisma.venda.findMany({
      where,
      include: {
        itens: {
          include: {
            produto: {
              include: {
                categoria: true,
              },
            },
          },
        },
        pagamentos: true,
        container: {
          include: {
            condominio: true,
          },
        },
      },
    });

    // Análises
    const totalVendas = vendas.length;
    const valorTotal = vendas.reduce(
      (acc, v) => acc + Number(v.valorTotal),
      0
    );
    const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;

    // Vendas por status
    const vendasPorStatus = vendas.reduce((acc: any, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {});

    // Produtos mais vendidos
    const produtosVendidos: any = {};
    vendas.forEach((venda) => {
      venda.itens.forEach((item) => {
        const key = item.produtoId;
        if (!produtosVendidos[key]) {
          produtosVendidos[key] = {
            produto: item.produto,
            quantidade: 0,
            valorTotal: 0,
          };
        }
        produtosVendidos[key].quantidade += item.quantidade;
        produtosVendidos[key].valorTotal += Number(item.valorTotal);
      });
    });

    const topProdutos = Object.values(produtosVendidos)
      .sort((a: any, b: any) => b.quantidade - a.quantidade)
      .slice(0, 10);

    // Vendas por categoria
    const vendasPorCategoria: any = {};
    vendas.forEach((venda) => {
      venda.itens.forEach((item) => {
        const categoria = item.produto.categoria.nome;
        if (!vendasPorCategoria[categoria]) {
          vendasPorCategoria[categoria] = {
            quantidade: 0,
            valorTotal: 0,
          };
        }
        vendasPorCategoria[categoria].quantidade += item.quantidade;
        vendasPorCategoria[categoria].valorTotal += Number(item.valorTotal);
      });
    });

    res.json({
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
      resumo: {
        totalVendas,
        valorTotal,
        ticketMedio,
        vendasPorStatus,
      },
      topProdutos,
      vendasPorCategoria,
    });
  } catch (error) {
    throw error;
  }
};

export const relatorioEstoque = async (req: Request, res: Response) => {
  try {
    const { containerId } = req.query;

    const where = containerId ? { containerId: String(containerId) } : {};

    const estoque = await prisma.containerEstoque.findMany({
      where,
      include: {
        produto: {
          include: {
            categoria: true,
          },
        },
        container: {
          include: {
            condominio: true,
          },
        },
      },
    });

    // Análises
    const totalProdutos = estoque.length;
    const valorTotalEstoque = estoque.reduce(
      (acc, e) => acc + e.quantidade * Number(e.produto.valorCompra),
      0
    );

    // Produtos com estoque baixo
    const estoqueBaixo = estoque.filter(
      (e) => e.quantidade <= e.produto.estoqueMinimo
    );

    // Produtos próximos do vencimento
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 7); // 7 dias

    const produtosVencendo = estoque.filter(
      (e) => e.dataValidade && e.dataValidade <= dataLimite
    );

    // Estoque por categoria
    const estoquePorCategoria: any = {};
    estoque.forEach((e) => {
      const categoria = e.produto.categoria.nome;
      if (!estoquePorCategoria[categoria]) {
        estoquePorCategoria[categoria] = {
          quantidade: 0,
          valorTotal: 0,
          produtos: 0,
        };
      }
      estoquePorCategoria[categoria].quantidade += e.quantidade;
      estoquePorCategoria[categoria].valorTotal +=
        e.quantidade * Number(e.produto.valorCompra);
      estoquePorCategoria[categoria].produtos++;
    });

    res.json({
      resumo: {
        totalProdutos,
        valorTotalEstoque,
        produtosEstoqueBaixo: estoqueBaixo.length,
        produtosVencendo: produtosVencendo.length,
      },
      estoqueBaixo,
      produtosVencendo,
      estoquePorCategoria,
    });
  } catch (error) {
    throw error;
  }
};

export const relatorioFinanceiro = async (req: Request, res: Response) => {
  try {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      throw new AppError('Data de início e fim são obrigatórias', 400);
    }

    const vendas = await prisma.venda.findMany({
      where: {
        createdAt: {
          gte: new Date(String(dataInicio)),
          lte: new Date(String(dataFim)),
        },
        status: 'PAGO',
      },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
        pagamentos: true,
      },
    });

    let receitaTotal = 0;
    let custoTotal = 0;

    vendas.forEach((venda) => {
      receitaTotal += Number(venda.valorTotal);
      venda.itens.forEach((item) => {
        custoTotal += item.quantidade * Number(item.produto.valorCompra);
      });
    });

    const lucroTotal = receitaTotal - custoTotal;
    const margemLucro =
      receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;

    // Pagamentos por método
    const pagamentosPorMetodo: any = {};
    vendas.forEach((venda) => {
      venda.pagamentos.forEach((pag) => {
        const metodo = pag.metodoPagamento;
        if (!pagamentosPorMetodo[metodo]) {
          pagamentosPorMetodo[metodo] = {
            quantidade: 0,
            valorTotal: 0,
          };
        }
        pagamentosPorMetodo[metodo].quantidade++;
        pagamentosPorMetodo[metodo].valorTotal += Number(pag.valorPago);
      });
    });

    res.json({
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
      resumo: {
        receitaTotal,
        custoTotal,
        lucroTotal,
        margemLucro: margemLucro.toFixed(2) + '%',
        totalVendas: vendas.length,
      },
      pagamentosPorMetodo,
    });
  } catch (error) {
    throw error;
  }
};

export const dashboard = async (req: Request, res: Response) => {
  try {
    // Últimos 30 dias
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 30);

    const [
      totalCondominios,
      totalContainers,
      totalProdutos,
      totalVendas,
      vendasPendentes,
      vendasHoje,
    ] = await Promise.all([
      prisma.condominio.count({ where: { ativo: true } }),
      prisma.container.count({ where: { ativo: true } }),
      prisma.produto.count({ where: { ativo: true } }),
      prisma.venda.count({
        where: {
          createdAt: { gte: dataInicio },
        },
      }),
      prisma.venda.count({ where: { status: 'PENDENTE' } }),
      prisma.venda.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Valor total vendas últimos 30 dias
    const vendas = await prisma.venda.findMany({
      where: {
        createdAt: { gte: dataInicio },
        status: 'PAGO',
      },
    });

    const valorTotal = vendas.reduce(
      (acc, v) => acc + Number(v.valorTotal),
      0
    );

    res.json({
      resumo: {
        totalCondominios,
        totalContainers,
        totalProdutos,
        totalVendas,
        vendasPendentes,
        vendasHoje,
        valorTotalUltimos30Dias: valorTotal,
      },
    });
  } catch (error) {
    throw error;
  }
};
