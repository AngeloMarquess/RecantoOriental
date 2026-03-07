import { signup } from '../auth/actions'
import Link from 'next/link'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams?.error as string | undefined
  const message = resolvedSearchParams?.message as string | undefined

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900 uppercase tracking-wide">
          Criar Conta
        </h2>
        <p className="mt-2 text-center text-sm text-stone-500">
          Junte-se ao Recanto Oriental Delivery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-2xl border border-stone-100 sm:px-10">
          <form className="space-y-4" action={signup}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-stone-700"
              >
                Nome Completo
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-xl shadow-sm bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-stone-700"
              >
                Telefone / WhatsApp
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-xl shadow-sm bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700"
              >
                E-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-xl shadow-sm bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-stone-700"
                >
                  Senha
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-xl shadow-sm bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-stone-700"
                >
                  Confirmar Senha
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-xl shadow-sm bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            {message && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                {message}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-secondary hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
              >
                Cadastrar
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-stone-500">
                  Já tem uma conta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-3 px-4 border border-stone-300 rounded-xl shadow-sm text-sm font-bold text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Fazer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
