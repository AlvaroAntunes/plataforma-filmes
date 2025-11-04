"use client"

import { useState, useEffect } from "react"
import { Camera, Film, Award, Play, ExternalLink, Star, Calendar, MapPin, Sparkles, Heart, Users } from "lucide-react"
import Image from "next/image"
import { useTranslation } from "@/hooks/useTranslation"

export default function MakingOf() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState(0)

  const categories = [
    {
      id: 0,
      title: t('makingOfPage.behindScenesTitle'),
      icon: <Camera className="w-5 h-5" />,
      description: t('makingOfPage.behindScenesDesc')
    },
    {
        id: 1,
        title: t('makingOfPage.productionStillsTitle'),
        icon: <Film className="w-5 h-5" />,
        description: t('makingOfPage.productionStillsDesc')
    },
    {
        id: 2,
        title: t('makingOfPage.festivalLaurelsTitle'),
        icon: <Award className="w-5 h-5" />,
        description: t('makingOfPage.festivalLaurelsDesc')
    }
  ]

  const behindScenesImages = [
    {
      id: 1,
      image: "https://drive.usercontent.google.com/download?id=1Qkn2whSvZc9d9r_8G6fq8txh8aD3h0p3"
    },
    {
      id: 2,
      image: "https://drive.usercontent.google.com/download?id=1-66WgQHWB2tIzxr1FhZyrrVAZfcjsFDK"
    },
    {
      id: 3,
      image: "https://drive.usercontent.google.com/download?id=1hmpjRZ7kMzfjC2ZPNsqHUnQ6Yh2YvSGE"
    },
    {
      id: 4,
      image: "https://drive.usercontent.google.com/download?id=1XZwpQeREPcAiKp0PBvwhmVWIBo6PGwJc"
    },
    {
      id: 5,
      image: "https://drive.usercontent.google.com/download?id=1pBg8wgXBhW9U34pzFZi9WQBiIWIFJ1Jk"
    },
    {
      id: 6,
      image: "https://drive.usercontent.google.com/download?id=18MDuXmyzrwNJt50PSO2RTdZ7mexNr2nv"
    },
    {
      id: 7,
      image: "https://drive.usercontent.google.com/download?id=11GF5g9XtZRAOKhONsQ11Kinv5KXNMOx5"
    },
    {
      id: 8,
      image: "https://drive.usercontent.google.com/download?id=1BQeyBPqSDEPZwOqSwTCugvkjQMa-fJDQ"
    },
    {
      id: 9,
      image: "https://drive.usercontent.google.com/download?id=1u2Y-gwVYPBBlOu8dCm4FzecyUE93Q1dF"
    },
    {
      id: 10,
      image: "https://drive.usercontent.google.com/download?id=1aM4u6VEte_Hfs8PQqmzq__8sLb5qfpUF"
    },
    {
      id: 11,
      image: "https://drive.usercontent.google.com/download?id=1Q48uSgOZ3j5390pqZRpyXJHYBDtpymbW"
    },
    {
      id: 12,
      image: "https://drive.usercontent.google.com/download?id=1UbdLUfhqHKQr-mMGCKzHnZJ3Wt4zEiQb"
    },
    {
      id: 13,
      image: "https://drive.usercontent.google.com/download?id=16jvEbwNFCKgXa-wbGIcb0PVIEX2-P5Cp"
    },
    {
      id: 14,
      image: "https://drive.usercontent.google.com/download?id=13eW1lnrpUdONfRy-KL9KaV9Ax89rzk-B"
    },
    {
      id: 15,
      image: "https://drive.usercontent.google.com/download?id=1eDMPOMReQRI_EqnvRTM9_MwvgNiUPalP"
    },
    {
      id: 16,
      image: "https://drive.usercontent.google.com/download?id=1RJE8SujaK4CsF_3HBM6VSCUZ0fztdp1W"
    },
    {
      id: 17,
      image: "https://drive.usercontent.google.com/download?id=1ACwxC0---E4LJ3bgQH1399rk4I4iY8l1"
    },
    {
      id: 18,
      image: "https://drive.usercontent.google.com/download?id=19fjleefJhTswz9x1rBSXBNh5ttwSR4Ib"
    },
    {
      id: 19,
      image: "https://drive.usercontent.google.com/download?id=1FZphZ87ExjIvt34SzBs0cAmOs6jDLysV"
    },
    {
      id: 20,
      image: "https://drive.usercontent.google.com/download?id=1F07pbCN3WnEUG_WG5OIRW-j30eNO7ZL-"
    },
    {
      id: 21,
      image: "https://drive.usercontent.google.com/download?id=19yM_fF50aToyOgC06DbqJxEQTuN2_hj9"
    },
    {
      id: 22,
      image: "https://drive.usercontent.google.com/download?id=14HEOWzwFRQZOTlfFIb7jnuSsnkOW1zWt"
    },
    {
      id: 23,
      image: "https://drive.usercontent.google.com/download?id=1S2DfD-p_tkBSKmO3mMhNMCXkGIGXMm8t"
    },
    {
      id: 24,
      image: "https://drive.usercontent.google.com/download?id=16YHJY45niK9vlIBVSm94fZP3XbmuuL9h"
    },
    {
      id: 25,
      image: "https://drive.usercontent.google.com/download?id=1TkBRpjWbCXUeiNX2LRHbZTLrakAmtF9I"
    },
    {
      id: 26,
      image: "https://drive.usercontent.google.com/download?id=1vskdoZvIL4SYUtnyO2LVOSUsvRo4pIgf"
    },
    {
      id: 27,
      image: "https://drive.usercontent.google.com/download?id=1WYfZkr5v599x9fAwNxsRAPwiepgPIUW9"
    },
    {
      id: 28,
      image: "https://drive.usercontent.google.com/download?id=1eVkuNA5Z_1AYkA6n0kZJdCLfDxB_tWKM"
    },
    {
      id: 29,
      image: "https://drive.usercontent.google.com/download?id=1Ymp0j_pvXYUZMWsyEjbBcUyWqvb-wVJ9"
    },
    {
      id: 30,
      image: "https://drive.usercontent.google.com/download?id=1mPcA5jDsp8x-Jjtq3S-qsJ_zem_ba3Xn"
    },
    {
      id: 31,
      image: "https://drive.usercontent.google.com/download?id=1aL8aXyQgZYTeySzJGBxFB9Tp5uivWllg"
    },
    {
      id: 32,
      image: "https://drive.usercontent.google.com/download?id=1Ymoe1uOA8WOOIT2W9kLIdvBKfFoasRfL"
    },
    {
      id: 33,
      image: "https://drive.usercontent.google.com/download?id=1I7oK2C4-drT6G76LvbBRnHtQU7tR4KE0"
    },
    {
      id: 34,
      image: "https://drive.usercontent.google.com/download?id=1JtsWQbvtUQFLSw5x--cS2TUJCSU95pIR"
    },
    {
      id: 35,
      image: "https://drive.usercontent.google.com/download?id=13oWd0Ch6rYjsLRfaGvjbKNKnKcD5fIMj"
    },
    {
      id: 36,
      image: "https://drive.usercontent.google.com/download?id=1yqyymfiXbGQtHalkk3NCd0_wgtkzqvo-"
    },
    {
      id: 37,
      image: "https://drive.usercontent.google.com/download?id=1hAbu-LDPtVWEPAvd2T7Kzrosz7xKt0mU"
    },
    {
      id: 38,
      image: "https://drive.usercontent.google.com/download?id=1EH5GHS5NRAPSaQ58Sb8AfyGF71KE08Dl"
    },
    {
      id: 39,
      image: "https://drive.usercontent.google.com/download?id=1pngKsZHV76iDJ6q_pILIBDMQXrBf1JGj"
    },
    {
      id: 40,
      image: "https://drive.usercontent.google.com/download?id=1L5xw1B5ZFgIaLjgHKBItmUgrV6O8quwI"
    },
    {
      id: 41,
      image: "https://drive.usercontent.google.com/download?id=1mYfgaymfSJSBoQEBtdITZEshKBHEyB7o"
    },
    {
      id: 42,
      image: "https://drive.usercontent.google.com/download?id=16IkyFIlkozXtfQ8frBbFXATbMWkXXRMZ"
    },
    {
      id: 43,
      image: "https://drive.usercontent.google.com/download?id=1sLjtvOQpLZD025OE0Ha2jyWsv19Vui26"
    },
    {
      id: 44,
      image: "https://drive.usercontent.google.com/download?id=1kW-r2goMS5anVvoKP8N0UphDj84mIrwv"
    },
    {
      id: 45,
      image: "https://drive.usercontent.google.com/download?id=14ntTFBjpj4jA38V-nXiMaqA6nabc1Eb-"
    },
    {
      id: 46,
      image: "https://drive.usercontent.google.com/download?id=1XbfI7TLqXNPNZXloi1e4IQvybNd6XVaa"
    },
    {
      id: 47,
      image: "https://drive.usercontent.google.com/download?id=18h8Z7lc5k-MV5_-d6w63robcOWHwvNNN"
    },
    {
      id: 48,
      image: "https://drive.usercontent.google.com/download?id=1WdE_9-bXdCawlgZ7EcLnzBsdjNNN0TgE"
    }
  ]

  const productionStills = [
    {
        id: 1,
        image: "https://drive.usercontent.google.com/download?id=1BCt_MHhRmaTPYI_G6JI3Xu1r64GYgrxT"
    },
    {
        id: 2,
        image: "https://drive.usercontent.google.com/download?id=1gM3COBBstf-8tJLbrBTBP2E3lpInHXR6"
    },
    {
        id: 3,
        image: "https://drive.usercontent.google.com/download?id=1VtZgfgKAi1vX-B7sSWvBdJ_1OYH_uz_D"
    },
    {
        id: 4,
        image: "https://drive.usercontent.google.com/download?id=1WgEwBJ_6B5xl-sRg0QHkoJCyGsSQoJyZ"
    },
    {
        id: 5,
        image: "https://drive.usercontent.google.com/download?id=1pPGHeHM2a-VTz1OK9spCs3NadkAcUHoR"
    },
    {
        id: 6,
        image: "https://drive.usercontent.google.com/download?id=1fGegrqKlWXZkJXVDV0bNHsBtE1PYRWML"
    },
    {
        id: 7,
        image: "https://drive.usercontent.google.com/download?id=1iXOkSwqniVzWZqlBnhZLENd1CxM5zeVc"
    },
    {
        id: 8,
        image: "https://drive.usercontent.google.com/download?id=1UGoifJISQsHtj_-tva7tODTv9mSLlBTX"
    },
    {
        id: 9,
        image: "https://drive.usercontent.google.com/download?id=1n5Olb0uuepg4heivjVUUYtl7kBtIf7Jp"
    },
    {
        id: 10,
        image: "https://drive.usercontent.google.com/download?id=11kG0kVe02z8QLt0DVvl_VZvcN8t8fbqs"
    },
    {
        id: 11,
        image: "https://drive.usercontent.google.com/download?id=1JF-Pm3N_M61wjyLL5Mv6HZn0WjkT7xTG"
    },
    {
        id: 12,
        image: "https://drive.usercontent.google.com/download?id=1K-u9caVFPofk7NB4vnrFuLK7Zh5rT67j"
    },
    {
        id: 13,
        image: "https://drive.usercontent.google.com/download?id=1MCrJxPqjRH7Ljd0rDvyTKYvvMz1DXjU8"
    },
    {
        id: 14,
        image: "https://drive.usercontent.google.com/download?id=1wfDI0wtvMB88iTV3_YpZ7RdUBfAyoI_Q"
    },
    {
        id: 15,
        image: "https://drive.usercontent.google.com/download?id=1AwFXNbQQz0-9_oEudnL4uZvYaWYwzvDP"
    },
    {
        id: 16,
        image: "https://drive.usercontent.google.com/download?id=1vJ2fFIhHO-ns7ewAy7EpSrpMD3UZk_Eu"
    },
    {
        id: 17,
        image: "https://drive.usercontent.google.com/download?id=1p4FC21r6vM36RMrJzoIA7vchpkJD3X_o"
    },
    {
        id: 18,
        image: "https://drive.usercontent.google.com/download?id=1AaiB6V39izaeczlwBHwd5_D0KXKZ67kA"
    },
    {
        id: 19,
        image: "https://drive.usercontent.google.com/download?id=1tLMv9gqbxPbO61L_cJYeBSfdr1tb6ij7"
    },
    {
        id: 20,
        image: "https://drive.usercontent.google.com/download?id=1CwVf-09A3sJZ7SYay9HhHVEiNYEizRFj"
    },
    {
        id: 21,
        image: "https://drive.usercontent.google.com/download?id=1mLLG2v_dZmZgUO3H_N1Y3oVnLAz481nJ"
    },
    {
        id: 22,
        image: "https://drive.usercontent.google.com/download?id=1scV65gFCG6ETh_pDhdImubS7OLBGJShh"
    },
    {
        id: 23,
        image: "https://drive.usercontent.google.com/download?id=1HNjjUOGyQ8MwLwHd8PY3qC06A4Xerh6-"
    },
    {
        id: 24,
        image: "https://drive.usercontent.google.com/download?id=164pO6aug8efEm62WWTrIpnTZxImddb1I"
    },
    {
        id: 25,
        image: "https://drive.usercontent.google.com/download?id=1G4mt6hphUXrUYS1b1rHyqROgTf7eAE2F"
    },
    {
        id: 26,
        image: "https://drive.usercontent.google.com/download?id=1uSem-_kzW6fhLr6PJeOfiXRcd6aESCJ1"
    },
    {
        id: 27,
        image: "https://drive.usercontent.google.com/download?id=1lvuVz4rj9tziGylYkFdD1PMi1dC4bUF0"
    },
    {
        id: 28,
        image: "https://drive.usercontent.google.com/download?id=1LHQtVMpiNs4VBSj3D5e_vUvfcxAX4-Kc"
    },
    {
        id: 29,
        image: "https://drive.usercontent.google.com/download?id=1x2WCC8MWnwpZY28nxs9WS9LrTBMv5RRL"
    },
    {
        id: 30,
        image: "https://drive.usercontent.google.com/download?id=1ww6lGNT_tVor5w_MivUMtiDLzq8R7lxy"
    },
    {
        id: 31,
        image: "https://drive.usercontent.google.com/download?id=1p1Eoct5YnshrmrvnmRtVSzHcGusDNbrW"
    },
    {
        id: 32,
        image: "https://drive.usercontent.google.com/download?id=19VoiopJnh6D8qXYF-h6SeLl4C5ZSnt2l"
    },
    {
        id: 33,
        image: "https://drive.usercontent.google.com/download?id=158IOG8nxx5-hdHc8s6dNlJN5KvbhHclm"
    },
    {
        id: 34,
        image: "https://drive.usercontent.google.com/download?id=1ZHW652X_aitzV_SR0-vOpTuHNbQIS9aO"
    },
    {
        id: 35,
        image: "https://drive.usercontent.google.com/download?id=1B_8Urfj-kC8QtnrV6DiE03rtBwaIjvGd"
    },
    {
        id: 36,
        image: "https://drive.usercontent.google.com/download?id=1ndd1qHtP4b9KieVZz2MEN0EIrNw8LLh4"
    },
    {
        id: 37,
        image: "https://drive.usercontent.google.com/download?id=1g5ZYVtRIOXG3wXflVl3PLmsO-a5-Igmp"
    },
    {
        id: 38,
        image: "https://drive.usercontent.google.com/download?id=18wb4VzxJnp8hssnOYaN9xuhsT3URYukI"
    },
    {
        id: 39,
        image: "https://drive.usercontent.google.com/download?id=1ypVM0nlAqjeOuEFfSuAeXJ3YVmH1iET8"
    },
    {
        id: 40,
        image: "https://drive.usercontent.google.com/download?id=1tPAw289NwOEKQTZL5xjCsQ38tJxGlsd3"
    }
  ]

  const festivalLaurels = [
    {
        id: 1,
        image: "https://drive.usercontent.google.com/download?id=1DYt3qgtqNyEHeZjuveZT3C9O0F-je_bd"
    },
    {
        id: 2,
        image: "https://drive.usercontent.google.com/download?id=1uCo6oNSudeWHHfA0V6ceU2Pejkp3kFzs"
    },
    {
        id: 3,
        image: "https://drive.usercontent.google.com/download?id=10XeppczGlMkXf1sQABRbI_d8XjkGMc-C"
    },
    {
        id: 4,
        image: "https://drive.usercontent.google.com/download?id=1I5G9fP771IxGdyNEu08E5AAjPVbwF32E"
    },
    {
        id: 5,
        image: "https://drive.usercontent.google.com/download?id=1X50Z9IsHZ44HBcwSjCMlDXupbxNqm_DF"
    },
    {
        id: 6,
        image: "https://drive.usercontent.google.com/download?id=1lOARgJveVZJwCmsCTnO41lN0PY8O87cn"
    },
    {
        id: 7,
        image: "https://drive.usercontent.google.com/download?id=1hWjZ579yOSscAcliHyl8-aeY8C1sTEwV"
    },
    {
        id: 8,
        image: "https://drive.usercontent.google.com/download?id=1Ffv_MIKyN6rnY27oVufJtN6Qd5VlOreB"
    },
    {
        id: 9,
        image: "https://drive.usercontent.google.com/download?id=1e9VBs5q-1xJ6NHGJ5B8Q9TA4flFvLASK"
    },
    {
        id: 10,
        image: "https://drive.usercontent.google.com/download?id=1cptxZP_VrPk9QvHRQzIr50T9zkQ1kGNK"
    },
    {
        id: 11,
        image: "https://drive.usercontent.google.com/download?id=1oe95GlPi8YtTFUWVriSGhM3I1C-__xMn"
    },
    {
        id: 12,
        image: "https://drive.usercontent.google.com/download?id=1DXEagkCsxQQ7OqyCrsIW1EGy6T8HdvlX"
    },
    {
        id: 13,
        image: "https://drive.usercontent.google.com/download?id=1IEIMxNLUK__u335ilUS5t3ywOKIP1-Pr"
    },
    {
        id: 14,
        image: "https://drive.usercontent.google.com/download?id=1W21-3iElRUvIMRTfXP9Z2fsxOT2NadP_"
    },
    {
        id: 15,
        image: "https://drive.usercontent.google.com/download?id=1YWaSKJMwcJhCFOFCsNUEVNsIQiF4bp3a"
    },
    {
        id: 16,
        image: "https://drive.usercontent.google.com/download?id=1woXq95AHShbVK-meWZuyt-OAPlWfuC-i"
    },
    {
        id: 17,
        image: "https://drive.usercontent.google.com/download?id=1cfKkzIVe_MAv5S18Jp7r6lAGebwyrF1K"
    },
    {
        id: 18,
        image: "https://drive.usercontent.google.com/download?id=10X04yGZ1L80-6btqWDqr7K5o5xuTDBDp"
    },
    {
        id: 19,
        image: "https://drive.usercontent.google.com/download?id=1pihG5hfEkPWPtE1m0uOBmqbNybWcNs5z"
    },
    {
        id: 20,
        image: "https://drive.usercontent.google.com/download?id=1WrMBO5vfLUytSLjyMQApuHmitJcirqH1"
    }
  ] 

  const getCurrentContent = () => {
    switch (activeCategory) {
      case 0:
        return behindScenesImages
      case 1:
        return productionStills
      case 2:
        return festivalLaurels
      default:
        return behindScenesImages
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Camera className="w-12 h-12 text-pink-400" />
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {t('makingOfPage.title')}
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('makingOfPage.subtitle')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {['🎬', '📸', '🏆', '🎭', '✨'].map((emoji, i) => (
              <span 
                key={i} 
                className="text-3xl animate-bounce" 
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 mb-12">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(index)}
                className={`relative p-4 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 w-full md:flex-1 md:max-w-[320px] min-h-[120px] md:min-h-[140px] ${
                  activeCategory === index
                    ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-400/50 shadow-lg shadow-pink-500/25'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15'
                }`}
              >
                <div className="flex flex-col justify-between h-full">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      activeCategory === index ? 'bg-pink-500/20 text-pink-400' : 'bg-white/10 text-white'
                    }`}>
                      {category.icon}
                    </div>
                    <h3 className="font-bold text-white text-left text-sm md:text-base leading-tight">{category.title}</h3>
                  </div>
                  <p className="text-gray-300 text-xs md:text-sm text-left leading-tight">{category.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Gallery */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
              {categories[activeCategory].icon}
              <span className="ml-3">{categories[activeCategory].title}</span>
            </h2>
            <p className="text-gray-300 text-lg">{categories[activeCategory].description}</p>
          </div>

          {/* Gallery Grid */}
          <div className={`grid gap-6 ${
            activeCategory === 2 
              ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' // Festival laurels in smaller grid
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' // Other content in larger grid
          }`}>
            {getCurrentContent().map((item, index) => (
              <div
                key={item.id}
                className="relative group cursor-pointer"
                onClick={() => window.open(item.image, '_blank')}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
                  <Image
                    src={item.image}
                    alt={`Image ${item.id}`}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                    // style={{ backgroundColor: "rgb(88, 28, 135)" }}
                  />
                  
                  {/* Simple hover effect */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Video indicator for making of videos */}
                  {activeCategory === 3 && (
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full p-2">
                      <Play className="w-5 h-5 text-pink-400" />
                    </div>
                  )}

                  {/* Award indicator for festival laurels */}
                  {activeCategory === 2 && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-full p-2 border border-yellow-400/30">
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-3xl p-8 md:p-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Sparkles className="w-8 h-8 text-pink-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">{t('makingOfPage.collaborateTitle')}</h2>
            </div>
            
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              {t('makingOfPage.collaborateDesc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/partner'}
                className="flex items-center justify-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25"
              >
                <Users className="w-6 h-6" />
                <span>{t('makingOfPage.partnerWithUs')}</span>
              </button>
              
              <button 
                onClick={() => window.location.href = '/about'}
                className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <Heart className="w-6 h-6 text-red-400" />
                <span>{t('makingOfPage.learnMore')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Footer */}
      <div className="px-8 pb-6">
        <div className="flex justify-center space-x-2">
          {['🎬', '📷', '🏆', '✨', '🎭', '🎪', '💫', '🌟'].map((emoji, i) => (
            <span 
              key={i} 
              className="text-xl animate-pulse" 
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
