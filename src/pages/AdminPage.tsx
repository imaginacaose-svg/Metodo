import { useState } from 'react';
import {
  Calculator,
  Copy,
  Check,
  Link2,
  User,
  DollarSign,
  RefreshCw,
  Home,
  Car,
  Percent,
  FileText,
  SlidersHorizontal,
  Info,
  Shield,
  TrendingUp,
  X,
} from 'lucide-react';
import { formatCurrency } from '../utils/format';

type ConsortiumType = 'imobiliario' | 'automovel';
type TabType = 'proposta' | 'taxa';
type LanceType = 'fixo' | 'livre' | 'nenhum';

interface FormData {
  creditValue: string;
  firstInstallment: string;
  otherInstallments: string;
  postContemplationInstallment: string;
  months: string;
  sellerName: string;
  clientName: string;
  isParcelinha: boolean;
  consortiumType: ConsortiumType;
  taxaAdministrativa: number;
  fundoReserva: number;
  lanceType: LanceType;
  lanceLivreValue: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('proposta');
  const [formData, setFormData] = useState<FormData>({
    creditValue: '',
    firstInstallment: '',
    otherInstallments: '',
    postContemplationInstallment: '',
    months: '',
    sellerName: '',
    clientName: '',
    isParcelinha: false,
    consortiumType: 'imobiliario',
    taxaAdministrativa: 16,
    fundoReserva: 2,
    lanceType: 'nenhum',
    lanceLivreValue: '',
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (field: keyof FormData, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setGeneratedLink('');
    setCopied(false);
  };

  const generateLink = () => {
    const params = new URLSearchParams();
    params.set('credito', formData.creditValue);
    params.set('parcela1', formData.firstInstallment);
    params.set('parcelas', formData.otherInstallments);
    params.set('meses', formData.months);
    params.set('vendedor', formData.sellerName);
    params.set('cliente', formData.clientName);
    params.set('parcelinha', formData.isParcelinha ? '1' : '0');
    params.set('tipo', formData.consortiumType);
    params.set('taxa_adm', formData.taxaAdministrativa.toString());
    params.set('fundo_reserva', formData.fundoReserva.toString());
    params.set('lance_type', formData.lanceType);

    if (formData.lanceType === 'livre' && formData.lanceLivreValue) {
      params.set('lance_livre', formData.lanceLivreValue);
    }

    if (formData.isParcelinha && formData.postContemplationInstallment) {
      params.set('parcela_pos', formData.postContemplationInstallment);
    }

    const url = `${window.location.origin}/#/proposta?${params.toString()}`;
    setGeneratedLink(url);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const input = document.createElement('input');
      input.value = generatedLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      creditValue: '',
      firstInstallment: '',
      otherInstallments: '',
      postContemplationInstallment: '',
      months: '',
      sellerName: '',
      clientName: '',
      isParcelinha: false,
      consortiumType: 'imobiliario',
      taxaAdministrativa: 16,
      fundoReserva: 2,
      lanceType: 'nenhum',
      lanceLivreValue: '',
    });
    setGeneratedLink('');
    setCopied(false);
  };

  const handleCurrencyChange = (field: keyof FormData, rawValue: string) => {
    const numbers = rawValue.replace(/\D/g, '');
    const numValue = numbers ? (parseInt(numbers) / 100).toFixed(2) : '';
    handleChange(field, numValue);
  };

  const getDisplayValue = (field: keyof FormData): string => {
    const val = formData[field];
    if (typeof val !== 'string' || !val) return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return formatCurrency(num);
  };

  const previewTotal = () => {
    const p1 = parseFloat(formData.firstInstallment) || 0;
    const outras = parseFloat(formData.otherInstallments) || 0;
    const meses = parseInt(formData.months) || 0;
    const posContemplacao = parseFloat(formData.postContemplationInstallment) || 0;

    let total = p1 + outras * (meses - 1);
    if (formData.isParcelinha && posContemplacao > 0) {
      const mesesAntes = Math.min(6, meses);
      const mesesDepois = meses - mesesAntes;
      total = p1 + outras * (mesesAntes - 1) + posContemplacao * mesesDepois;
    }

    return { total };
  };

  const taxaCalculations = () => {
    const credito = parseFloat(formData.creditValue) || 0;
    const taxaValor = credito * (formData.taxaAdministrativa / 100);
    const fundoValor = credito * (formData.fundoReserva / 100);
    const totalEncargos = taxaValor + fundoValor;
    const creditoComEncargos = credito + totalEncargos;

    return {
      taxaValor,
      fundoValor,
      totalEncargos,
      creditoComEncargos,
    };
  };

  const calc = taxaCalculations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Método Consórcio</h1>
              <p className="text-slate-400 text-xs">Gerador de Propostas</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('proposta')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'proposta'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Proposta
            </button>
            <button
              onClick={() => setActiveTab('taxa')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'taxa'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Percent className="w-4 h-4" />
              Taxa Administrativa
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'proposta' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                <h2 className="text-white font-semibold text-lg mb-4">Tipo de Consórcio</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleChange('consortiumType', 'imobiliario')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      formData.consortiumType === 'imobiliario'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-600/50 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Home className="w-8 h-8" />
                    <span className="font-semibold text-sm">Imobiliário</span>
                    <span className="text-xs opacity-70">Reajuste INCC</span>
                  </button>
                  <button
                    onClick={() => handleChange('consortiumType', 'automovel')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      formData.consortiumType === 'automovel'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-600/50 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Car className="w-8 h-8" />
                    <span className="font-semibold text-sm">Automóvel</span>
                    <span className="text-xs opacity-70">Reajuste IPCA</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  Dados da Proposta
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 text-sm mb-1.5 block">Nome do Cliente</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => handleChange('clientName', e.target.value)}
                      placeholder="Ex: João Silva"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-1.5 block">Nome do Vendedor</label>
                    <input
                      type="text"
                      value={formData.sellerName}
                      onChange={(e) => handleChange('sellerName', e.target.value)}
                      placeholder="Ex: Maria Santos"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Valores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 text-sm mb-1.5 block">Valor do Crédito</label>
                    <input
                      type="text"
                      value={getDisplayValue('creditValue')}
                      onChange={(e) => handleCurrencyChange('creditValue', e.target.value)}
                      placeholder="R$ 0,00"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-1.5 block">Quantidade de Meses</label>
                    <input
                      type="number"
                      value={formData.months}
                      onChange={(e) => handleChange('months', e.target.value)}
                      placeholder="Ex: 80"
                      min="1"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-1.5 block">Valor da 1ª Parcela</label>
                    <input
                      type="text"
                      value={getDisplayValue('firstInstallment')}
                      onChange={(e) => handleCurrencyChange('firstInstallment', e.target.value)}
                      placeholder="R$ 0,00"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-1.5 block">Valor das Demais Parcelas</label>
                    <input
                      type="text"
                      value={getDisplayValue('otherInstallments')}
                      onChange={(e) => handleCurrencyChange('otherInstallments', e.target.value)}
                      placeholder="R$ 0,00"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-slate-700/50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                        formData.isParcelinha ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                      onClick={() => handleChange('isParcelinha', !formData.isParcelinha)}
                    >
                      <div
                        className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm"
                        style={{ left: formData.isParcelinha ? '26px' : '2px' }}
                      />
                    </div>
                    <div>
                      <span className="text-white text-sm font-medium">Modalidade Parcelinha</span>
                      <p className="text-slate-400 text-xs">Parcela reduzida após contemplação</p>
                    </div>
                  </label>

                  {formData.isParcelinha && (
                    <div className="mt-4">
                      <label className="text-slate-300 text-sm mb-1.5 block">
                        Valor da Parcela Pós-Contemplação
                      </label>
                      <input
                        type="text"
                        value={getDisplayValue('postContemplationInstallment')}
                        onChange={(e) =>
                          handleCurrencyChange('postContemplationInstallment', e.target.value)
                        }
                        placeholder="R$ 0,00"
                        className="w-full bg-slate-700/50 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Opção de Lance
                </h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => handleChange('lanceType', 'nenhum')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      formData.lanceType === 'nenhum'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-600/50 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <X className="w-6 h-6" />
                    <span className="font-semibold text-xs">Sem Lance</span>
                  </button>
                  <button
                    onClick={() => handleChange('lanceType', 'fixo')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      formData.lanceType === 'fixo'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-600/50 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Percent className="w-6 h-6" />
                    <span className="font-semibold text-xs">Fixo 25%</span>
                  </button>
                  <button
                    onClick={() => handleChange('lanceType', 'livre')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      formData.lanceType === 'livre'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-600/50 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <DollarSign className="w-6 h-6" />
                    <span className="font-semibold text-xs">Livre</span>
                  </button>
                </div>

                {formData.lanceType === 'livre' && (
                  <div className="mt-4">
                    <label className="text-slate-300 text-sm mb-1.5 block">
                      Valor do Lance Livre (do próprio bolso)
                    </label>
                    <input
                      type="text"
                      value={getDisplayValue('lanceLivreValue')}
                      onChange={(e) => handleCurrencyChange('lanceLivreValue', e.target.value)}
                      placeholder="R$ 0,00"
                      className="w-full bg-slate-700/50 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                )}

                {formData.lanceType === 'fixo' && formData.creditValue && (
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                    <p className="text-emerald-300 text-sm">
                      💡 Lance fixo de 25%: <span className="font-bold">{formatCurrency((parseFloat(formData.creditValue) || 0) * 0.25)}</span>
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={generateLink}
                disabled={
                  !formData.creditValue ||
                  !formData.firstInstallment ||
                  !formData.otherInstallments ||
                  !formData.months ||
                  !formData.sellerName ||
                  !formData.clientName
                }
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold text-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Link2 className="w-5 h-5" />
                Gerar Link da Proposta
              </button>

              {generatedLink && (
                <div className="bg-slate-800/50 rounded-2xl border border-emerald-500/30 p-6 backdrop-blur-sm">
                  <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Link Gerado com Sucesso!
                  </h3>
                  <div className="bg-slate-900/80 rounded-xl p-4 mb-4">
                    <p className="text-slate-300 text-sm break-all font-mono">{generatedLink}</p>
                  </div>
                  <button
                    onClick={copyLink}
                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      copied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copiar Link
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-36 space-y-4">
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                  <h3 className="text-white font-semibold mb-4">📊 Prévia</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Tipo</span>
                      <span className="text-white font-medium">
                        {formData.consortiumType === 'imobiliario' ? '🏠 Imóvel' : '🚗 Automóvel'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Crédito</span>
                      <span className="text-white font-medium">
                        {formatCurrency(parseFloat(formData.creditValue) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Prazo</span>
                      <span className="text-white font-medium">{formData.months || '—'} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Taxa Adm.</span>
                      <span className="text-violet-400 font-medium">{formData.taxaAdministrativa}%</span>
                    </div>
                    {formData.lanceType !== 'nenhum' && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Lance</span>
                        <span className="text-emerald-400 font-medium">
                          {formData.lanceType === 'fixo' 
                            ? 'Fixo 25%' 
                            : `Livre ${formatCurrency(parseFloat(formData.lanceLivreValue) || 0)}`}
                        </span>
                      </div>
                    )}
                    <hr className="border-slate-700/50" />
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Total parcelas</span>
                      <span className="text-white font-bold">
                        {formatCurrency(previewTotal().total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'taxa' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl border border-violet-500/20 p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Percent className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg mb-1">
                      Simulador de Taxa Administrativa
                    </h2>
                    <p className="text-slate-300 text-sm">
                      A taxa administrativa varia de <span className="text-violet-400 font-semibold">16% a 21%</span> sobre
                      o valor do crédito, dependendo do grupo escolhido.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Valor do Crédito (referência)
                </h3>
                <input
                  type="text"
                  value={getDisplayValue('creditValue')}
                  onChange={(e) => handleCurrencyChange('creditValue', e.target.value)}
                  placeholder="R$ 0,00"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-lg font-semibold"
                />
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-violet-400" />
                  Taxa Administrativa do Grupo
                </h3>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-400 text-sm">16%</span>
                    <span className="text-violet-400 font-bold text-3xl">
                      {formData.taxaAdministrativa}%
                    </span>
                    <span className="text-slate-400 text-sm">21%</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="21"
                    step="0.5"
                    value={formData.taxaAdministrativa}
                    onChange={(e) =>
                      handleChange('taxaAdministrativa', parseFloat(e.target.value))
                    }
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((formData.taxaAdministrativa - 16) / 5) * 100}%, #334155 ${((formData.taxaAdministrativa - 16) / 5) * 100}%, #334155 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2">
                    {[16, 17, 18, 19, 20, 21].map((val) => (
                      <button
                        key={val}
                        onClick={() => handleChange('taxaAdministrativa', val)}
                        className={`text-xs px-2 py-1 rounded-md transition-all ${
                          formData.taxaAdministrativa === val
                            ? 'bg-violet-500/20 text-violet-400 font-bold'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-300 text-sm">
                      {formData.taxaAdministrativa <= 17
                        ? '🟢 Grupo com taxa reduzida — excelente condição!'
                        : formData.taxaAdministrativa <= 19
                        ? '🔵 Grupo com taxa padrão — condição equilibrada.'
                        : '🟡 Grupo com taxa mais alta — verifique benefícios adicionais.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Fundo de Reserva
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  O fundo de reserva protege o grupo em caso de inadimplência.
                </p>
                <div className="flex items-center gap-4">
                  {[0, 1, 2].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleChange('fundoReserva', val)}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                        formData.fundoReserva === val
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-slate-600/50 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-2xl border border-violet-500/30 p-6 backdrop-blur-sm">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-violet-400" />
                  Resultado da Simulação
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-800/50 rounded-xl p-4">
                    <div>
                      <p className="text-slate-400 text-sm">Valor do Crédito</p>
                      <p className="text-white font-semibold">
                        {formatCurrency(parseFloat(formData.creditValue) || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-800/50 rounded-xl p-4">
                    <div>
                      <p className="text-slate-400 text-sm">
                        Taxa Administrativa ({formData.taxaAdministrativa}%)
                      </p>
                      <p className="text-violet-400 font-semibold">
                        {formatCurrency(calc.taxaValor)}
                      </p>
                    </div>
                  </div>
                  {formData.fundoReserva > 0 && (
                    <div className="flex justify-between items-center bg-slate-800/50 rounded-xl p-4">
                      <div>
                        <p className="text-slate-400 text-sm">
                          Fundo de Reserva ({formData.fundoReserva}%)
                        </p>
                        <p className="text-blue-400 font-semibold">
                          {formatCurrency(calc.fundoValor)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                    <div>
                      <p className="text-violet-300 text-sm font-medium">Total de Encargos</p>
                      <p className="text-white font-bold text-xl">
                        {formatCurrency(calc.totalEncargos)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-36 space-y-4">
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                  <h3 className="text-white font-semibold mb-4">📋 Resumo Rápido</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Crédito</span>
                      <span className="text-white font-medium">
                        {formatCurrency(parseFloat(formData.creditValue) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Taxa Adm.</span>
                      <span className="text-violet-400 font-bold">
                        {formData.taxaAdministrativa}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Valor da Taxa</span>
                      <span className="text-violet-300 font-medium">
                        {formatCurrency(calc.taxaValor)}
                      </span>
                    </div>
                    <hr className="border-slate-700/50" />
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Total Encargos</span>
                      <span className="text-white font-bold">
                        {formatCurrency(calc.totalEncargos)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
                  <h3 className="text-white font-semibold mb-4 text-sm">Comparativo entre Grupos</h3>
                  <div className="space-y-2">
                    {[16, 17, 18, 19, 20, 21].map((taxa) => {
                      const valorTaxa = (parseFloat(formData.creditValue) || 0) * (taxa / 100);
                      const isSelected = taxa === formData.taxaAdministrativa;
                      return (
                        <div
                          key={taxa}
                          className={`flex justify-between items-center rounded-lg px-3 py-2 transition-all ${
                            isSelected
                              ? 'bg-violet-500/20 border border-violet-500/30'
                              : 'bg-slate-700/20'
                          }`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              isSelected ? 'text-violet-400' : 'text-slate-400'
                            }`}
                          >
                            Grupo {taxa}%
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              isSelected ? 'text-white' : 'text-slate-300'
                            }`}
                          >
                            {formatCurrency(valorTaxa)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
