import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Application Error:', err.message || err);

  let statusCode = err.status || 500;
  let errorMessage = err.message || 'Ocorreu um erro interno no servidor.';

  if (err.message === 'USER_ALREADY_EXISTS') {
    statusCode = 409;
    errorMessage = 'Este email ou @handle já está cadastrado no sistema. Tente fazer login ou escolha outro @handle.';
  } else if (err.message === 'INVALID_CREDENTIALS') {
    statusCode = 401;
    errorMessage = 'Email, @handle ou senha incorretos. Verifique suas credenciais.';
  } else if (err.message === 'USER_NOT_FOUND') {
    statusCode = 404;
    errorMessage = 'Usuário não encontrado.';
  } else if (err.message === 'SESSION_NOT_FOUND') {
    statusCode = 404;
    errorMessage = 'Sessão de pagamento não encontrada.';
  } else if (err.message?.includes('UNIQUE constraint failed')) {
    statusCode = 409;
    errorMessage = 'Este email ou @handle já está em uso. Escolha outro.';
  }

  res.status(statusCode).json({
    error: err.name || 'APPLICATION_ERROR',
    message: errorMessage
  });
}
