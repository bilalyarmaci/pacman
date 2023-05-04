// Gerekli tanılamalar
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let scoreElement = document.querySelector('#score');
let score = 0

// Canvas boyut ayarlaması
canvas.width = innerWidth;
canvas.height = innerHeight;

// Oyuncuların ("Pacman"lerin) aşmayacakları sınırı oluşturmak için kullanılacak sınıf yapısı
class Boundary {
    // Nesne üretmeden ulaşılabilen genişlik ve yükseklik parametreleri
    static width = 40;
    static height = 40;
    // Canvas'a çizmek için gerekli olacak pozisyon (x, y) ve genişlil-yükseklik parametrelerini ayarlayan yapıcı (constructor)
    constructor({ position, image }) {
        this.position = position;
        this.width = Boundary.width;
        this.height = Boundary.height;
        this.image = image
    }
    // Sınırı ekrana çizdiren metot
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y);
    }
}

// Pacman sınıfı
class Pacman {
    // Boundary sınıfındaki yapıcının benzeri
    // Daire oluşturulduğundan yarıçap (radius) değeri de gereklidir
    static speed = 2.5      // "Pacman"in hız ayarı için kullanılıyor
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
    }
    // Nesneyi ("pacman"i) ekrana çizdiren metot
    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    }
    // Hareket efekti için pozisyon (x ve y koordinatları) güncellemesi yaparak 'draw' metodunu çağıran metot
    move() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

// Hayalet (ghost) sınıfı
class Ghost {
    static speed = 1.5
    // Pacman sınıfındaki yapıcının benzeri
    constructor({ position, velocity, color = 'red' }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color
        this.prevCollisions = []
    }
    // Hayaleti ekrana çizdiren metot
    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    // Hareket efekti için pozisyon (x ve y koordinatları) güncellemesi yaparak 'draw' metodunu çağırır
    move() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

// Pellet (hap/top) sınıfı
class Pellet {
    // Pacman sınıfındaki yapıcının benzeri
    constructor({ position, velocity }) {
        this.position = position;
        this.radius = 3;
    }
    // Hapı ekrana çizdiren metot
    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }
}

// Pacman nesnesi oluşturuluyor
const pacman = new Pacman({
    // "Pacman"in koordinatları sınırın (duvarın) içinde kalacak şekilde sınır koordinatlarının değerleri üzerinden verilir
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: { // Başlangıç hızı yok - hareket yok
        x: 0,
        y: 0
    }
});

const boundaries = [];  // Sınırı oluşturan resimleri tutan dizi, yani sınırın ta kendisi
const pellets = [];  // Oluşturulan hapları tutan dizi
// Oluşturulan hayaletleri tutan dizi
const ghosts = [
    new Ghost({
        position: {
            x: Boundary.width * 7 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        }
    }),
    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height * 3  + Boundary.height / 2
        },
        velocity: {
            x: 0,
            y: Ghost.speed
        },
        color: 'pink'
    })
];

// Oyun haritasının temsili şablonu
const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
];

// Her bir karakter (sembol) için gerekli resmi oluşturmak için tanımlanan metot
function getImage(img) {
    let image = new Image();
    image.src = img;
    return image;
}

// Oluşturulan harita şablonu kullanılarak haritanın oluşturulması için dizilerin doldurulması
// row = satır, i = mevcut satır numarası
map.forEach((row, i) => {
    row.forEach((symbol, j) => { // Satırdaki her elemanı karşılaştırmak için satır içi tarama
        // symbol = o anki indisteki (sütundaki) eleman, j = mevcut indis (sütun) numarası
        switch (symbol) {
            case '-':
                boundaries.push(
                    new Boundary({  // '-' bulunması durumunda sınırı oluşturan diziye blok eklemesi yapılır. Halihazırdaki satır ve sütun değerleri dikkate alınarak pozisyon ataması yapılır.
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: getImage('img/pipeHorizontal.png')
                    })
                );
                break;
            case '|':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: getImage('./img/pipeVertical.png')
                    })
                );
                break;
            case '1':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: getImage('./img/pipeCorner1.png')
                    })
                );
                break;
            case '2':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: getImage('./img/pipeCorner2.png')
                    })
                );
                break;
            case '3':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: getImage('./img/pipeCorner3.png')
                    })
                );
                break;
            case '4':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: getImage('./img/pipeCorner4.png')
                    })
                );
                break;
            case 'b':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: getImage('./img/block.png')
                    })
                );
                break;
            case '[':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: getImage('./img/capLeft.png')
                    })
                );
                break;
            case ']':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: getImage('./img/capRight.png')
                    })
                );
                break;
            case '_':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: getImage('./img/capBottom.png')
                    })
                );
                break;
            case '^':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: getImage('./img/capTop.png')
                    })
                );
                break;
            case '+':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: getImage('./img/pipeCross.png')
                    })
                );
                break;
            case '5':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: getImage('./img/pipeConnectorTop.png')
                    })
                );
                break;
            case '6':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: getImage('./img/pipeConnectorRight.png')
                    })
                );
                break;
            case '7':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: getImage('./img/pipeConnectorBottom.png')
                    })
                );
                break;
            case '8':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: getImage('./img/pipeConnectorLeft.png')
                    })
                );
                break;
            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                );
                break;
        }
    });
});

// Basılan klavye tuşlarını tutan dizi
const keys = {
    w: {
        pressed: false
    },
    s: {
        pressed: false
    },
    a: {
        pressed: false
    },
    d: {
        pressed: false
    }
}
// Son basılan tuş
let lastKey = ''

// Tuşun basılmaya başlandığı anı dinler
addEventListener('keydown', ({ key }) => {
    switch (key) {  // Her tuş için durum güncellemesi yapılır. Hareket için 'animation' metodunda bu değerler kullanılıyor.
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
    }
});
// İlgili tuş serbest bırakıldığında durum güncellenir.
addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
});

// Nesnenin (pacman,hayalet) tek bir sınır bloğuyla çarpışıp çarpışmadığını hesplayıp döndüren metot
function isColliding({ circle, rectangle }) {
    // Hızın değiştirilmesi durumunda doğru ölçüm için 'padding' kullanılmakta
    const padding = Boundary.width / 2 - circle.radius - 1;
    return (circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding && circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding)
}

// Animasyon ID'sini tutan değişken. Oyun bittiğinde animasyonu durdumak için kullanılmakta.
let animationId;

// Canvas içerisindeki tüm çizimlerin tekrarlı bir biçimde çağırılmasıyla animasyon görünümü oluşturmakla sorumlu metot
function animate() {
    animationId = requestAnimationFrame(animate); // Animasyon için halihazırda var olan fonksiyon
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bir önceki çizimlerin silinmesini sağlayan fonksiyon

    /* Her animasyon tekrarında (animate metodunun tekrarında) iki kontrol yapılmakta:
    
    I. İlk kontrol sonucunda en son hangi tuş basılıyorsa (aynı anda birden fazla tuşa basıldığında son basılan tuş etki edecektir) o tuşun gerektirdiği hareket "pacman"e verilir,
    ANCAK:
    - Her bir tuş basımında gitmek istenilen yönde sınır (duvar bloğu) var mı diye kontrol edilir.
    - Bir tane dahi olması durumunda o yönde herhangi bir hız (velocity) verilmez (veya sıfır atanır) ve döngü kırılılarak (break) sonlandırılır.
    - Sonuçta engelin olduğu yöne gitme denemesi engellenir (II. kontrolün "pacman"i tamamen durdurması engellenir) ve pacman duvar bloğu çıkana kadar HALİHAZIRDA gitmek olduğu yönde hareketine devam eder. 

    *'lastKey' kontrolü aynı anda birden fazla tuşa basılması durumunda son basılan tuşun dikkate alınması için kullanılır. */
    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (isColliding({
                circle: {
                    ...pacman,
                    velocity: {
                        x: 0,
                        y: -Pacman.speed
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.y = 0;
                break;
            } else {
                pacman.velocity.y = -Pacman.speed;
            }
        }
    } else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (isColliding({
                circle: {
                    ...pacman,
                    velocity: {
                        x: 0,
                        y: Pacman.speed
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.y = 0;
                break;
            } else {
                pacman.velocity.y = Pacman.speed;
            }
        }
    } else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (isColliding({
                circle: {
                    ...pacman,
                    velocity: {
                        x: -Pacman.speed,
                        y: 0
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.x = 0;
                break;
            } else {
                pacman.velocity.x = -Pacman.speed;
            }
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (isColliding({
                circle: {
                    ...pacman,
                    velocity: {
                        x: Pacman.speed,
                        y: 0
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.x = 0;
                break;
            } else {
                pacman.velocity.x = Pacman.speed;
            }
        }
    }
    /* II. İkinci kontrol duvar blokları teker teker çizdirilirken her blok için ayrı ayrı yapılır. Bu sayede her bir animasyon döngüsünde pacman herhangi bir şekilde sınır bloğuna çarpması engellenir.
    Bir sonraki adımda çarpacak olması durumunda "pacman"in hareketi durar. */
    boundaries.forEach((boundary) => {
        boundary.draw();
        // Pacman'ın mevcut sınır bloğuna çarpıp çarpmadığının kontrolü
        if (isColliding({ circle: pacman, rectangle: boundary })) {
            pacman.velocity.x = 0;
            pacman.velocity.y = 0;
        };
    });

    /* Her animasyon tekrarında haplar pellets(haplar) dizisinin sonundan başlayarak çizdirilir. Bu yaklaşım yutulan hapın diziden silinmesinden sonra kalan hapları çizerken flaş(yanıp sönme) efekti vermemesi içindir.
    */
    for (let i = pellets.length - 1; i > 0; i--) {
        let pellet = pellets[i];
        pellet.draw();

        // Pacman ile hapın çarpışıp çarpışmadığının kontrolü. Sonucunda çarpışan hap diziden silinir.
        if (Math.hypot(pellet.position.x - pacman.position.x, pellet.position.y - pacman.position.y) < pellet.radius + pacman.radius) {
            pellets.splice(i, 1);
            score += 10
            scoreElement.innerHTML = score;
        }
    }

    // Dizideki tüm hayaletler için
    ghosts.forEach((ghost) => {
        ghost.move();

        // Pacman ile hayaletin çarpışıp çarpışmadığının kontrolü. Sonucunda oyun biter ve animasyon durdurulur.
        if (Math.hypot(ghost.position.x - pacman.position.x, ghost.position.y - pacman.position.y) < ghost.radius + pacman.radius) {
            cancelAnimationFrame(animationId);
            console.log("You lose!")
        }

        // Her blok parçası için ona bir sonraki harekette çarpmaya neden olacak yön bilgisini tutan dizi
        const collisions = []
        /* Mevcut hayalet için her blok parçası kontrol ediliyor.
        Eğer dizide çarpılacak yön bilgisi zaten mevcut değilse ve bir sonraki adımda o yönde bir çarpma olacaksa yön bilgisi diziye ekleniyor. */
        boundaries.forEach((boundary) => {
            if (!collisions.includes('up') && isColliding({
                circle: {
                    ...ghost,
                    velocity: {
                        x: 0,
                        y: -Ghost.speed
                    }
                },
                rectangle: boundary
            })
            ) { collisions.push('up'); }
            if (!collisions.includes('down') && isColliding({
                circle: {
                    ...ghost,
                    velocity: {
                        x: 0,
                        y: Ghost.speed
                    }
                },
                rectangle: boundary
            })
            ) { collisions.push('down'); }
            if (!collisions.includes('left') && isColliding({
                circle: {
                    ...ghost,
                    velocity: {
                        x: -Ghost.speed,
                        y: 0
                    }
                },
                rectangle: boundary
            })
            ) { collisions.push('left'); }
            if (!collisions.includes('right') && isColliding({
                circle: {
                    ...ghost,
                    velocity: {
                        x: Ghost.speed,
                        y: 0
                    }
                },
                rectangle: boundary
            })
            ) { collisions.push('right'); }
        })

        // Eğer yeni bir yön bilgisi geldi ise bir önceki yönleri tutan dizi güncelleniyor
        if (collisions.length > ghost.prevCollisions.length) {
            ghost.prevCollisions = collisions;
        }

        // Eğer mevcut ('prevCollisions' mevcut durumu gösterir, adlandırma kafa karışıklığına sebep olmasın) yönler ile bir sonraki adımdaki yönler ('collisions') farklı ise, o zaman yeni bir yön açılmış/kapanmış demektir.
        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
            // Halihazırda gitmekte olduğu yön 'prevCollisions'a eklenir
            if (ghost.velocity.x > 0) {
                ghost.prevCollisions.push('right');
            } else if (ghost.velocity.x < 0) {
                ghost.prevCollisions.push('left');
            }
            if (ghost.velocity.y < 0) {
                ghost.prevCollisions.push('up');
            } else if (ghost.velocity.y > 0) {
                ghost.prevCollisions.push('down');
            }

            console.log(collisions)
            console.log(ghost.prevCollisions)

            // Gidilebilecek açık yönler; mevcut durumda olup, bir sonraki durumda olmayan yönler
            const pathways = ghost.prevCollisions.filter(collision => {
                return !collisions.includes(collision);
            })

            console.log({ pathways });

            // Gidilecek yönün rastgele seçimi
            // Buraya halihazırda gidilen yön de dahildir.
            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            console.log({ direction });

            // Yön seçimine göre yön değişimini yapan switch-case yapısı
            switch (direction) {
                case 'right':
                    ghost.velocity.x = Ghost.speed;
                    ghost.velocity.y = 0;
                    break;
                case 'left':
                    ghost.velocity.x = -Ghost.speed;
                    ghost.velocity.y = 0;
                    break;
                case 'up':
                    ghost.velocity.x = 0;
                    ghost.velocity.y = -Ghost.speed;
                    break;
                case 'down':
                    ghost.velocity.x = 0;
                    ghost.velocity.y = Ghost.speed;
                    break;
            }
            ghost.prevCollisions = [] // Her seferinde sıfırlanmalı ki yeni yol bilgisini tutan dizi ('collisions') buna tekrar atansın.
        }
    })

    pacman.move(); // pacman nesnesinin hareketi için ilgili metot çağırısı
}

animate();