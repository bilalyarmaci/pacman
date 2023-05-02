// Canvas ve context tanımlamaları
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

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

// Sınırı oluşturan resimleri tutan dizi, yani sınırın ta kendisi
const boundaries = [];
// Oluşturulan hapları tutacak dizi
const pellets = []


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

// "Pacman"in tek bir sınır bloğuyla çarpışıp çarpışmadığını hesplayıp döndüren metot
function isColliding({ circle, rectangle }) {
    return (circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x && circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y)
}

// Canvas içerisindeki tüm çizimlerin tekrarlı bir biçimde çağırılmasıyla animasyon görünümü oluşturmakla sorumlu metot
function animate() {
    requestAnimationFrame(animate); // Animasyon için halihazırda var olan fonksiyon
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
                        y: -5
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.y = 0;
                break;
            } else {
                pacman.velocity.y = -5;
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
                        y: 5
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.y = 0;
                break;
            } else {
                pacman.velocity.y = 5;
            }
        }
    } else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (isColliding({
                circle: {
                    ...pacman,
                    velocity: {
                        x: -5,
                        y: 0
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.x = 0;
                break;
            } else {
                pacman.velocity.x = -5;
            }
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (isColliding({
                circle: {
                    ...pacman,
                    velocity: {
                        x: 5,
                        y: 0
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.x = 0;
                break;
            } else {
                pacman.velocity.x = 5;
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
        }
    }

    pacman.move(); // pacman nesnesinin hareketi için ilgili metot çağırısı
}

animate();