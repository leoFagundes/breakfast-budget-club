/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import AnimatedLogo from "@/components/animated-logo";
import Card from "@/components/card";
import Modal from "@/components/modal";
import { useEffect, useRef, useState } from "react";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { CardType, CategoryType } from "./types";
import CardRepository from "@/services/repositories/CardRepository";
import CategoryRepository from "@/services/repositories/CategoryRepository";
import * as Icons from "lucide-react";
import { IconMap, normalizeIconName } from "@/utils/icons";

export default function Home() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [grouped, setGrouped] = useState<
    { category: CategoryType; items: CardType[] }[]
  >([]);

  const [welcomeVideoOpen, setWelcomeVideoOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const ValidIcons = Object.fromEntries(
    Object.entries(Icons).filter(([k, v]) => typeof v === "function")
  ) as Record<string, React.ComponentType<any>>;

  function getIcon(name?: string) {
    if (!name) return null;

    const normalized = normalizeIconName(name);
    return IconMap[normalized] ?? null;
  }
  useEffect(() => {
    async function load() {
      const [cardList, categoryList] = await Promise.all([
        CardRepository.getAll(),
        CategoryRepository.getAll(),
      ]);

      setCards(cardList);
      setCategories(categoryList);

      const groupedResult = categoryList.map((cat) => ({
        category: cat,
        items: cardList.filter((c) => c.categoryId === cat.id),
      }));

      setGrouped(groupedResult);
    }

    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPlaying(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (playing && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [playing]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    const forceScroll = setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 100);

    document.body.style.overflow = "hidden";

    const unlockScroll = setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 3500);

    return () => {
      clearTimeout(forceScroll);
      clearTimeout(unlockScroll);
    };
  }, []);

  function CategorySection({
    title,
    children,
    icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon: React.ReactNode;
  }) {
    return (
      <>
        <div className="relative flex justify-center items-center my-4">
          <div className="h-[1px] w-full border-t border-dashed border-gray-600/50" />
          <span className="flex items-center gap-2 absolute bg-white rounded py-1 px-2 text-gray-600 font-semibold">
            {icon} {title}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-10">
          {children}
        </div>
      </>
    );
  }

  return (
    <div className="w-full flex flex-col items-center p-4 mb-8">
      <AnimatedLogo />

      <section
        id="hero-container"
        className="flex flex-col items-center gap-3 p-4"
      >
        <h1 className="text-gray-600 font-semibold text-xl sm:text-4xl text-center">
          Bem-vindo ao seu Clube de Café da Manhã Econômico!
        </h1>

        <div className="relative w-full max-w-[600px] aspect-video my-6 shadow-card rounded-sm overflow-hidden">
          <video
            src="video/welcome.mp4"
            autoPlay={playing}
            muted
            controls
            width="100%"
            height="100%"
            controlsList="nodownload"
            playsInline
            ref={videoRef}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        <div className="w-full flex flex-col gap-8 max-w-[80%]">
          {grouped
            .filter(({ items }) => items.length > 0)
            .map(({ category, items }) => {
              const Icon = ready ? getIcon(category.iconName) : null;

              return (
                <CategorySection
                  key={category.id}
                  title={category.name}
                  icon={Icon ? <Icon size={18} /> : null}
                >
                  {items.map((card) => (
                    <Card
                      key={card.id}
                      srcTitle={card.actionLabel}
                      title={card.title}
                      src={card.actionUrl}
                      icon={<FaArrowRightFromBracket />}
                      onClick={() => {
                        if (card.internalPage) {
                          window.location.href = `/cards/${card.id}`;
                        } else if (card.actionUrl) {
                          window.open(card.actionUrl, "_blank");
                        }
                      }}
                    />
                  ))}
                </CategorySection>
              );
            })}
        </div>

        <div className="w-full flex flex-col gap-8 max-w-[80%]">
          <div className="relative flex justify-center items-center my-4">
            <div className="h-[1px] w-full border-t border-dashed border-gray-600/50" />
            <span className="flex items-center gap-2 absolute bg-white rounded py-1 px-2 text-gray-600 font-semibold">
              <MdOutlineVideoLibrary /> Vídeos
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-10">
            <Card
              srcTitle="Assistir"
              onClick={() => setWelcomeVideoOpen(true)}
              title="Apresentação do Clube de Café da Manhã Econômico"
              icon={<FaArrowRightFromBracket />}
            />
            <Card
              srcTitle="Galeria"
              src="https://www.youtube.com/playlist?list=PLSksKII1HhP4yNgQBOkKS1Bv_5TXgjSY7"
              title="Treinamentos Disponíveis Online"
              icon={<FaArrowRightFromBracket />}
            />
          </div>
          <div className="relative flex justify-center items-center my-4">
            <div className="h-[1px] w-full border-t border-dashed border-gray-600/50" />
            <span className="flex items-center gap-2 absolute bg-white rounded py-1 px-2 text-gray-600 font-semibold">
              <FiDownload /> Downloads
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-10">
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/1ai6BBub17gxaU10W8qgzoL80ayM1_sax?usp=sharing"
              title="Politica de Privacidade & Formulário de Consentimento"
              icon={<FiDownload />}
            />
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/1gJM_3sCFLOX4IgJAk44QHxZMKjN3E58r?usp=sharing"
              title="Caminho & Estrutura de Treinamento"
              icon={<FiDownload />}
            />
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/14kwPOAsecjI98o1Onbvpbyj053567Yx6?usp=sharing"
              title="Pré-Lançamento de 6 Semanas"
              icon={<FiDownload />}
            />
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/16QgFBvoV_PtRRxNvpgTOyv4By7n_gke_?usp=sharing"
              title="Avaliação de Bem-Estar Presencial"
              icon={<FiDownload />}
            />
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/1zilMFJzIEfsXLcMlmzc7cDdQlje0SnY-?usp=sharing"
              title="Revisão de Duas Semanas"
              icon={<FiDownload />}
            />
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/1sJdIL_c8B258gCIOizl468cJdDSZHFO3?usp=sharing "
              title="Checklists do Clube de Café da Manhã Econômico"
              icon={<FiDownload />}
            />
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/1Gf0deImbwe6Ku7U7xnjkwtmL8dPrbl7o?usp=sharing "
              title="Administrando um Clube de Nutrição"
              icon={<FiDownload />}
            />
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/1GR2EV3R9CXFI-H5v5Oe3D0wIS5skU3mJ?usp=sharing "
              title="Clube de Café da Manhã Online"
              icon={<FiDownload />}
            />
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/1XolJtnhHWOUVBiB86uenNYI_mYnsV2GS?usp=sharing"
              title="Todos os Documentos do Aprendiz"
              icon={<FiDownload />}
            />
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/1WNBh45WUWHQx-YqTNp9nSV3YzI1qCm2r?usp=sharing"
              title="Todos os Documentos do Parceiro Júnior"
              icon={<FiDownload />}
            />
            <Card
              srcTitle="Baixar"
              src="https://drive.google.com/drive/folders/1yUlVq_GW5mD9KVTY0gvS-XOXRlwyWA2w?usp=sharing"
              title="Rastreadores do Clube de Café da Manhã Econômico"
              icon={<FiDownload />}
            />
          </div>
          <div className="relative flex justify-center items-center my-4">
            <div className="h-[1px] w-full border-t border-dashed border-gray-600/50" />
            <span className="flex items-center gap-2 absolute bg-white rounded py-1 px-2 text-gray-600 font-semibold">
              <FaArrowRightFromBracket /> Links
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-10">
            <Card
              srcTitle="Acessar"
              src="https://pt.research.net/r/cadastrofacilevs"
              title="Registre seu Clube aqui"
              icon={<FaArrowRightFromBracket />}
            />
          </div>
        </div>
      </section>
      <Modal
        isOpen={welcomeVideoOpen}
        onClose={() => setWelcomeVideoOpen(false)}
      >
        <div className="relative w-full max-w-[600px] aspect-video my-6 shadow-card rounded-sm overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/_khxh51-ZPU?si=_ay956ZPcLXN7Sjn&autoplay=1&mute=1&rel=0&modestbranding=1&controls=1"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-sm"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </Modal>
    </div>
  );
}
