import { createFileRoute } from "@tanstack/react-router";
import { BlogPostPage } from "@/components/BlogPostPage";

export const Route = createFileRoute("/blog-vie-new-hope")({
  component: BlogVieNewHope,
});

function BlogVieNewHope() {
  return (
    <BlogPostPage
      categoryFr="Vie à l'orphelinat"
      categoryEn="Life at the Orphanage"
      titleFr="Partager les moments qui comptent"
      titleEn="Sharing the moments that matter"
      heroImage="/legacy/images/how-it-works-reporting.jpg"
      heroAltFr="Moments de vie à New Hope Orphanage"
      heroAltEn="Life moments at New Hope Orphanage"
      publishDate="21 août 2026 / August 21, 2026"
    >
      <div>
        {/* French Content */}
        <div data-lang="fr">
          <p>
            Derrière chaque activité, chaque projet et chaque journée passée à New
            Hope Orphanage, il y a des enfants qui apprennent, jouent, découvrent,
            progressent et construisent peu à peu leur avenir.
          </p>

          <p>
            La vie dans un environnement d'accueil ne se résume pas aux besoins
            essentiels. Les moments de partage, les activités éducatives, les
            célébrations et les petites réussites du quotidien jouent également un
            rôle important dans le développement des enfants.
          </p>

          <p>
            À travers nos mises à jour, nous souhaitons permettre à nos supporters et
            partenaires de mieux comprendre ce qui se passe au quotidien au sein de
            New Hope Orphanage.
          </p>

          <h2>Des journées rythmées par l'apprentissage</h2>

          <p>
            L'éducation occupe une place importante dans la vie des enfants.
          </p>

          <p>
            Les journées peuvent être ponctuées par les études, les devoirs, la
            lecture, les activités éducatives et différentes occasions d'apprendre.
          </p>

          <p>
            Ces moments contribuent à créer une routine qui encourage la curiosité, la
            concentration et le plaisir d'apprendre.
          </p>

          <p>
            Mais apprendre ne signifie pas uniquement être assis devant un livre. Les
            échanges, les activités pratiques et les expériences quotidiennes peuvent
            également devenir des occasions d'apprentissage.
          </p>

          <h2>Des moments pour jouer et s'exprimer</h2>

          <p>
            Le jeu est une composante importante du développement d'un enfant.
          </p>

          <p>
            Jouer permet de développer la créativité, l'imagination, la communication
            et les relations avec les autres.
          </p>

          <p>
            Les activités récréatives offrent également aux enfants l'occasion de se
            détendre, de s'amuser et de créer des souvenirs positifs.
          </p>

          <p>
            Ces moments peuvent sembler simples, mais ils contribuent à créer une
            enfance équilibrée et un environnement dans lequel les enfants peuvent se
            sentir à leur place.
          </p>

          <h2>Célébrer les petites réussites</h2>

          <p>
            Un bon résultat scolaire, une nouvelle compétence, une activité réussie
            ou une étape personnelle franchie sont autant de raisons de reconnaître les
            progrès d'un enfant.
          </p>

          <p>
            Prendre le temps de célébrer ces moments permet de montrer aux enfants que
            leurs efforts sont importants.
          </p>

          <p>
            Les encouragements peuvent renforcer leur confiance et leur donner envie de
            continuer à apprendre et à progresser.
          </p>

          <h2>Les activités collectives</h2>

          <p>
            Les activités en groupe permettent aux enfants de développer des relations
            et d'apprendre à collaborer.
          </p>

          <p>
            Qu'il s'agisse d'un atelier, d'une activité créative, d'un moment sportif
            ou d'un projet collectif, ces expériences permettent aux enfants de
            partager des responsabilités et de découvrir les forces de chacun.
          </p>

          <p>
            Elles peuvent également favoriser le respect, l'entraide et le sentiment
            d'appartenance à une communauté.
          </p>

          <h2>L'importance des bénévoles et des partenaires</h2>

          <p>
            La vie de New Hope Orphanage est également soutenue par les personnes qui
            choisissent de donner de leur temps, de leurs compétences ou de leurs
            ressources.
          </p>

          <p>
            Les bénévoles et partenaires peuvent contribuer à différentes activités et
            apporter une présence supplémentaire qui enrichit le quotidien des
            enfants.
          </p>

          <p>
            Leur implication rappelle qu'une communauté plus large peut se mobiliser
            pour soutenir les enfants et leur avenir.
          </p>

          <h2>Partager les histoires avec nos supporters</h2>

          <p>
            Les personnes qui soutiennent New Hope Orphanage, qu'elles soient au
            Cameroun ou à l'étranger, souhaitent souvent savoir comment leur soutien
            contribue à la mission.
          </p>

          <p>
            Partager des nouvelles, des activités et des moments importants permet de
            maintenir ce lien.
          </p>

          <p>
            Ces mises à jour sont une manière de remercier les personnes qui nous
            accompagnent et de leur montrer les différentes dimensions de la vie au
            sein de l'organisation.
          </p>

          <h2>Une vie faite de nombreux petits moments</h2>

          <p>
            L'impact ne se mesure pas toujours à travers de grands événements.
          </p>

          <p>
            Il peut se trouver dans une journée d'école réussie, une nouvelle
            compétence acquise, un moment de jeu, une conversation, un sourire ou la
            satisfaction d'avoir accompli quelque chose pour la première fois.
          </p>

          <p>
            Tous ces moments participent au développement d'un enfant.
          </p>

          <h2>Continuer à avancer ensemble</h2>

          <p>
            New Hope Orphanage poursuit son engagement auprès des enfants avec la
            conviction qu'un environnement stable, bienveillant et encourageant peut
            contribuer à ouvrir de nouvelles possibilités.
          </p>

          <p>
            À travers nos actualités, nous continuerons à partager les projets, les
            activités, les événements et les moments importants de la vie à
            l'orphelinat à Yaoundé et à Douala.
          </p>

          <p>
            Merci à toutes les personnes qui suivent notre travail, qui partagent
            notre mission et qui contribuent à créer davantage d'opportunités pour les
            enfants au Cameroun.
          </p>
        </div>

        {/* English Content */}
        <div data-lang="en">
          <p>
            Behind every activity, every project, and every day spent at New Hope
            Orphanage, there are children who learn, play, discover, progress, and
            gradually build their future.
          </p>

          <p>
            Life in a care environment is not limited to basic needs. Moments of
            sharing, educational activities, celebrations, and small daily successes
            also play an important role in children's development.
          </p>

          <p>
            Through our updates, we want to allow our supporters and partners to
            better understand what happens on a daily basis at New Hope Orphanage.
          </p>

          <h2>Days filled with learning</h2>

          <p>
            Education occupies an important place in children's lives.
          </p>

          <p>
            Days can be punctuated by studying, homework, reading, educational
            activities, and various opportunities to learn.
          </p>

          <p>
            These moments help create a routine that encourages curiosity,
            concentration, and the joy of learning.
          </p>

          <p>
            But learning doesn't just mean sitting in front of a book. Exchanges,
            practical activities, and daily experiences can also become learning
            opportunities.
          </p>

          <h2>Moments to play and express themselves</h2>

          <p>
            Play is an important component of a child's development.
          </p>

          <p>
            Playing helps develop creativity, imagination, communication, and
            relationships with others.
          </p>

          <p>
            Recreational activities also give children the opportunity to relax, have
            fun, and create positive memories.
          </p>

          <p>
            These moments may seem simple, but they help create a balanced childhood
            and an environment where children can feel at home.
          </p>

          <h2>Celebrating small successes</h2>

          <p>
            Good school results, a new skill, a successful activity, or a personal
            milestone achieved are all reasons to recognize a child's progress.
          </p>

          <p>
            Taking the time to celebrate these moments shows children that their
            efforts are important.
          </p>

          <p>
            Encouragement can strengthen their confidence and give them the desire to
            continue learning and progressing.
          </p>

          <h2>Group activities</h2>

          <p>
            Group activities allow children to develop relationships and learn to
            collaborate.
          </p>

          <p>
            Whether it's a workshop, a creative activity, a sports moment, or a group
            project, these experiences allow children to share responsibilities and
            discover everyone's strengths.
          </p>

          <p>
            They can also promote respect, mutual aid, and a sense of belonging to a
            community.
          </p>

          <h2>The importance of volunteers and partners</h2>

          <p>
            Life at New Hope Orphanage is also supported by people who choose to give
            their time, skills, or resources.
          </p>

          <p>
            Volunteers and partners can contribute to various activities and bring an
            additional presence that enriches children's daily lives.
          </p>

          <p>
            Their involvement reminds us that a wider community can mobilize to
            support children and their future.
          </p>

          <h2>Sharing stories with our supporters</h2>

          <p>
            People who support New Hope Orphanage, whether in Cameroon or abroad, often
            want to know how their support contributes to the mission.
          </p>

          <p>
            Sharing news, activities, and important moments helps maintain this
            connection.
          </p>

          <p>
            These updates are a way to thank the people who accompany us and show them
            the different dimensions of life within the organization.
          </p>

          <h2>A life made of many small moments</h2>

          <p>
            Impact is not always measured through great events.
          </p>

          <p>
            It can be found in a successful school day, a new skill acquired, a
            moment of play, a conversation, a smile, or the satisfaction of having
            accomplished something for the first time.
          </p>

          <p>
            All these moments contribute to a child's development.
          </p>

          <h2>Continuing to move forward together</h2>

          <p>
            New Hope Orphanage continues its commitment to children with the
            conviction that a stable, caring, and encouraging environment can help
            open new possibilities.
          </p>

          <p>
            Through our news, we will continue to share projects, activities, events,
            and important moments of life at the orphanage in Yaoundé and Douala.
          </p>

          <p>
            Thank you to all the people who follow our work, share our mission, and
            contribute to creating more opportunities for children in Cameroon.
          </p>
        </div>
      </div>
    </BlogPostPage>
  );
}
