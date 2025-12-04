import React from "react";
import Image from "next/image";
import { Bentham } from "next/font/google";

// Configurar la fuente Bentham
const bentham = Bentham({
	weight: "400",
	subsets: ["latin"],
});

export function UniversityHeader() {
	return (
		<>
			{/* Header Universitario con bordes azules */}
			<div className="bg-white border-t-[6px] border-b-[6px] border-[#16469B]">
				<div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-3 sm:py-2">
					<div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
						{/* Logo Universidad */}
						<div className="relative">
							<Image
								src="/logo.png"
								alt="Universidad de Sonora"
								width={75}
								height={75}
								className="w-12 h-12 sm:w-15 sm:h-15 lg:w-[110px] lg:h-[110px] rounded-full object-cover"
								priority
							/>
						</div>
						<div className="text-center sm:text-left px-8 space-x-6 leading-10">
							<h1
								className={`text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#16469B] ${bentham.className} tracking-wider`}
							>
								UNIVERSIDAD DE SONORA
							</h1>
							<p
								className={`text-xs sm:text-xl text-[#16469B] italic font-semibold ${bentham.className} tracking-wider`}
							>
								El Saber de mis Hijos hará mi Grandeza
							</p>
						</div>
					</div>
					{/* Avatar usuario */}
					<div className="w-8 h-8 sm:w-[3.7rem] sm:h-[3.7rem] bg-[#E6B10F] rounded-full flex items-center justify-center mt-3 mr-4 sm:mr-4 sm:mt-0">
						<svg
							className="w-4 h-4 sm:w-11 sm:h-11 text-white"
							viewBox="0 0 29 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"								
						>
							<path
								d="M14.0918 15C20.5662 15 26.0833 18.8287 28.1846 24.1924C27.6727 24.7007 27.1325 25.1809 26.5684 25.6318C25.0035 20.7076 20.095 17 14.0918 17C8.08869 17.0001 3.18001 20.7076 1.61523 25.6318C1.05117 25.181 0.511795 24.7006 0 24.1924C2.10129 18.8288 7.61752 15.0001 14.0918 15ZM14.0918 0C17.4055 0 20.0918 2.68629 20.0918 6C20.0918 9.31371 17.4055 12 14.0918 12C10.7782 11.9999 8.0918 9.31363 8.0918 6C8.0918 2.68637 10.7782 0.00013194 14.0918 0ZM14.0918 2C11.8828 2.00013 10.0918 3.79094 10.0918 6C10.0918 8.20906 11.8828 9.99987 14.0918 10C16.3009 10 18.0918 8.20914 18.0918 6C18.0918 3.79086 16.3009 2 14.0918 2Z"
								fill="white"
							/>
						</svg>
					</div>
				</div>
			</div>

			{/* Breadcrumb naranja */}
			<div className="bg-[#E6B10F] text-white px-3 sm:px-6 py-3 sm:py-6 shadow-sm">
				<h2 className="text-base sm:text-lg font-normal text-[#16469B]">Gestión de Roles</h2>
			</div>
		</>
	);
}