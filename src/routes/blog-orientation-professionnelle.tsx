import { createFileRoute } from "@tanstack/react-router";
import { BlogPostPage } from "@/components/BlogPostPage";

export const Route = createFileRoute("/blog-orientation-professionnelle")({
  component: BlogOrientationProfessionnelle,
});

function BlogOrientationProfessionnelle() {
  return (
    <BlogPostPage
      categoryFr="Orientation professionnelle"
      categoryEn="Career Guidance"
      titleFr="Préparer les jeunes à construire leur avenir"
      titleEn="Preparing young people to build their future"
      heroImage="/legacy/images/how-it-works-healthcare.jpg"
      heroAltFr="Orientation professionnelle pour les jeunes à New Hope Orphanage"
      heroAltEn="Career guidance for young people at New Hope Orphanage"
      publishDate="21 août 2026 / August 21, 2026"
    >
      <div>
        {/* French Content */}
        <div data-lang="fr">
          <p>
            Pour un enfant qui grandit, penser à l'avenir peut parfois sembler
            lointain. Pourtant, les choix faits pendant l'adolescence et les
            premières expériences de découverte du monde professionnel peuvent jouer
            un rôle important dans la construction de la vie adulte.
          </p>

          <p>
            À New Hope Orphanage, nous croyons que préparer les jeunes à leur avenir
            ne consiste pas uniquement à leur donner accès à l'éducation. Il est
            également essentiel de les aider à découvrir leurs talents, à identifier
            leurs centres d'intérêt et à comprendre les différentes possibilités qui
            peuvent s'offrir à eux.
          </p>

          <h2>Aider chaque jeune à découvrir son potentiel</h2>

          <p>
            Chaque enfant possède des qualités, des aptitudes et une personnalité qui
            lui sont propres. Certains peuvent être attirés par les métiers
            techniques, d'autres par les domaines créatifs, l'entrepreneuriat, les
            sciences, l'éducation, le numérique, la santé, l'artisanat ou encore les
            métiers de service.
          </p>

          <p>
            L'orientation professionnelle permet aux jeunes de mieux comprendre ces
            possibilités et de réfléchir progressivement au type de parcours qui
            pourrait leur correspondre.
          </p>

          <p>
            L'objectif n'est pas de décider à leur place. Il s'agit plutôt de leur
            donner les informations, les conseils et les encouragements nécessaires
            pour qu'ils puissent prendre des décisions éclairées concernant leur
            avenir.
          </p>

          <h2>Découvrir les métiers et les parcours possibles</h2>

          <p>
            Le monde professionnel évolue rapidement. De nombreux métiers qui existent
            aujourd'hui n'étaient pas connus ou accessibles de la même manière il y a
            quelques années.
          </p>

          <p>
            Présenter aux jeunes différents secteurs professionnels peut leur
            permettre d'élargir leur vision de l'avenir. Découvrir un métier,
            comprendre les compétences nécessaires pour l'exercer et connaître les
            formations disponibles sont autant d'étapes qui peuvent aider un jeune à
            mieux se projeter.
          </p>

          <p>
            Cette découverte peut également permettre de corriger certaines idées
            reçues et de montrer qu'il existe plusieurs chemins possibles vers une vie
            professionnelle épanouissante.
          </p>

          <h2>Développer la confiance en soi</h2>

          <p>
            L'orientation professionnelle ne concerne pas uniquement le choix d'un
            métier. Elle contribue aussi au développement personnel.
          </p>

          <p>
            Apprendre à identifier ses forces, parler de ses ambitions, poser des
            questions, présenter ses idées et réfléchir à ses objectifs sont des
            compétences importantes pour la vie adulte.
          </p>

          <p>
            Pour certains jeunes, le simple fait de découvrir qu'ils ont des
            compétences et des talents qui peuvent être valorisés peut avoir un impact
            considérable sur leur confiance en eux.
          </p>

          <h2>Relier l'éducation à la vie professionnelle</h2>

          <p>
            L'école constitue une base essentielle, mais les connaissances
            académiques prennent encore plus de sens lorsqu'un jeune comprend comment
            elles peuvent être utilisées dans la vie réelle.
          </p>

          <p>
            Les mathématiques, la communication, les langues, les sciences, les outils
            numériques et les compétences sociales peuvent tous trouver leur place
            dans différents métiers.
          </p>

          <p>
            L'orientation professionnelle permet justement de faire le lien entre ce
            que les jeunes apprennent et les possibilités qui existent au-delà de
            l'école.
          </p>

          <h2>Accompagner les jeunes vers l'autonomie</h2>

          <p>
            L'un des objectifs importants de notre accompagnement est de préparer les
            jeunes à devenir progressivement autonomes.
          </p>

          <p>
            Cela signifie les aider à réfléchir à leurs objectifs, à comprendre les
            exigences du monde professionnel et à développer une attitude responsable
            face à leur avenir.
          </p>

          <p>
            L'autonomie ne se construit pas en un jour. Elle se développe à travers
            l'apprentissage, l'expérience, l'encouragement et la possibilité de faire
            des choix.
          </p>

          <h2>Construire un avenir avec espoir</h2>

          <p>
            Pour New Hope Orphanage, l'orientation professionnelle représente donc bien
            plus qu'une discussion sur les métiers.
          </p>

          <p>
            C'est une manière d'aider les jeunes à imaginer leur avenir avec
            confiance, à comprendre leurs possibilités et à croire qu'ils peuvent
            contribuer positivement à leur communauté.
          </p>

          <p>
            Au Cameroun, notamment à Yaoundé et à Douala, les jeunes ont besoin
            d'opportunités, de conseils et de personnes capables de les encourager à
            développer leur potentiel.
          </p>

          <p>
            Chaque jeune mérite la possibilité de rêver d'un avenir meilleur et de
            disposer des outils nécessaires pour commencer à le construire.
          </p>

          <h2>Comment soutenir cette mission ?</h2>

          <p>
            Les personnes, entreprises et organisations qui souhaitent contribuer au
            développement des jeunes peuvent soutenir New Hope Orphanage à travers
            différentes formes de partenariat, de bénévolat et de soutien.
          </p>

          <p>
            Ensemble, nous pouvons contribuer à créer un environnement dans lequel les
            enfants et les jeunes ne se contentent pas de grandir : ils se préparent à
            construire leur propre avenir.
          </p>
        </div>

        {/* English Content */}
        <div data-lang="en">
          <p>
            For a growing child, thinking about the future can sometimes feel far away.
            Yet the choices made during adolescence and the first experiences of
            discovering the professional world can play an important role in building
            an adult life.
          </p>

          <p>
            At New Hope Orphanage, we believe that preparing young people for their
            future is not just about giving them access to education. It is also
            essential to help them discover their talents, identify their interests,
            and understand the various possibilities that may be available to them.
          </p>

          <h2>Helping every young person discover their potential</h2>

          <p>
            Every child has unique qualities, abilities, and personality. Some may be
            drawn to technical trades, others to creative fields, entrepreneurship,
            sciences, education, digital technology, healthcare, crafts, or service
            professions.
          </p>

          <p>
            Career guidance allows young people to better understand these
            possibilities and to gradually think about the type of path that might
            suit them.
          </p>

          <p>
            The goal is not to decide for them. Rather, it is to provide them with
            the information, advice, and encouragement they need to make informed
            decisions about their future.
          </p>

          <h2>Discovering careers and possible paths</h2>

          <p>
            The professional world is evolving rapidly. Many careers that exist today
            were not known or accessible in the same way just a few years ago.
          </p>

          <p>
            Exposing young people to different professional sectors can help them
            broaden their vision of the future. Discovering a career, understanding
            the skills needed to practice it, and learning about available training
            are all steps that can help a young person project themselves forward.
          </p>

          <p>
            This discovery can also help correct certain misconceptions and show that
            there are several possible paths toward a fulfilling professional life.
          </p>

          <h2>Building self-confidence</h2>

          <p>
            Career guidance is not just about choosing a profession. It also
            contributes to personal development.
          </p>

          <p>
            Learning to identify one's strengths, talk about ambitions, ask
            questions, present ideas, and reflect on goals are important skills for
            adult life.
          </p>

          <p>
            For some young people, simply discovering that they have skills and
            talents that can be valued can have a considerable impact on their
            self-confidence.
          </p>

          <h2>Connecting education to professional life</h2>

          <p>
            School provides an essential foundation, but academic knowledge takes on
            even more meaning when a young person understands how it can be applied
            in real life.
          </p>

          <p>
            Mathematics, communication, languages, sciences, digital tools, and social
            skills can all find their place in different careers.
          </p>

          <p>
            Career guidance is precisely about making the connection between what
            young people learn and the possibilities that exist beyond school.
          </p>

          <h2>Guiding young people toward independence</h2>

          <p>
            One of the important goals of our support is to prepare young people to
            gradually become independent.
          </p>

          <p>
            This means helping them think about their goals, understand the
            requirements of the professional world, and develop a responsible attitude
            toward their future.
          </p>

          <p>
            Independence is not built in a day. It develops through learning,
            experience, encouragement, and the ability to make choices.
          </p>

          <h2>Building a future with hope</h2>

          <p>
            For New Hope Orphanage, career guidance represents much more than a
            discussion about professions.
          </p>

          <p>
            It is a way to help young people imagine their future with confidence,
            understand their possibilities, and believe that they can contribute
            positively to their community.
          </p>

          <p>
            In Cameroon, particularly in Yaoundé and Douala, young people need
            opportunities, advice, and people who can encourage them to develop their
            potential.
          </p>

          <p>
            Every young person deserves the possibility of dreaming of a better
            future and having the tools needed to start building it.
          </p>

          <h2>How to support this mission?</h2>

          <p>
            Individuals, businesses, and organizations that wish to contribute to the
            development of young people can support New Hope Orphanage through various
            forms of partnership, volunteering, and support.
          </p>

          <p>
            Together, we can help create an environment where children and young
            people don't just grow up — they prepare to build their own future.
          </p>
        </div>
      </div>
    </BlogPostPage>
  );
}
