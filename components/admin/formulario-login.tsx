"use client";

import { useActionState } from "react";
import { entrar, type EstadoLogin } from "@/app/admin/actions";
import { Button, Input } from "@/components/ui";

const INICIAL: EstadoLogin = {};

export function FormularioLogin() {
  const [estado, acao, pendente] = useActionState(entrar, INICIAL);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <Input
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        required
      />

      <Input
        id="senha"
        name="senha"
        type="password"
        label="Senha"
        autoComplete="current-password"
        required
      />

      {estado.erro ? (
        <p role="alert" className="text-xs text-error">
          {estado.erro}
        </p>
      ) : null}

      <Button type="submit" loading={pendente}>
        Entrar
      </Button>
    </form>
  );
}
