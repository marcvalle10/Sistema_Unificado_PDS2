import React, { useState } from "react";
import Image from "next/image";
import { UserAvatarProps } from "@/types";

export function UserAvatar({ user }: UserAvatarProps) {
	const [imageError, setImageError] = useState(false);

	const initials = user.nombre
		.split(" ")
		.map((n) => n[0])
		.join("")
		.substring(0, 2)
		.toUpperCase();

	// Si no hay imagen o hubo error, mostrar iniciales
	if (!user.imagen || imageError) {
		return (
			<div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-medium text-orange-700">
				{initials}
			</div>
		);
	}

	// Mostrar imagen con manejo de errores
	return (
		<div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
			<Image
				src={user.imagen}
				alt={`Avatar de ${user.nombre}`}
				width={24}
				height={24}
				className="w-full h-full object-cover"
				onError={() => setImageError(true)}
			/>
		</div>
	);
}